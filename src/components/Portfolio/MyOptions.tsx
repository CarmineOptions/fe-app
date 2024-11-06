import { useAccount, useSendTransaction } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";
import { OptionWithPosition } from "../../classes/Option";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";
import { timestampToPriceGuardDate, formatNumber } from "../../utils/utils";
import {
  openCloseOptionDialog,
  setCloseOption,
  showToast,
} from "../../redux/actions";
import { tradeSettle } from "../../calls/tradeSettle";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";
import { ToastType } from "../../redux/reducers/ui";
import { usePositions } from "../../hooks/usePositions";
import { useCurrency } from "../../hooks/useCurrency";
import styles from "./portfolio.module.css";
import { useConnectWallet } from "../../hooks/useConnectWallet";

const Header = ({ state }: { state: "live" | "itm" | "otm" }) => {
  return (
    <div className={`${styles.header} ${styles.item} ${styles[state]}`}>
      <div>Pair</div>
      <div>Side</div>
      <div>Type</div>
      <div>Strike</div>
      <div>Maturity</div>
      <div>Size</div>
      {(state === "live" || state === "itm") && <div>Value</div>}
      {(state === "live" || state === "itm") && <div>Value $</div>}
      <div></div>
    </div>
  );
};

const LiveItem = ({ option }: { option: OptionWithPosition }) => {
  const price = useCurrency(option.underlying.id);
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.optionitem}`;

  const handleClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };

  const valueUsd =
    price === undefined ? "--" : (option.value * price).toFixed(2);

  return (
    <div className={className}>
      <div>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size="small"
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>{option.strikeWithCurrency}</div>
      <div className={styles.maturity}>
        <span>{date}</span>
        <span>{time}</span>
      </div>
      <div>{formatNumber(option.size, 4)}</div>
      <div>
        <div className={styles.tokenvalue}>
          {formatNumber(option.value, 3)}
          <TokenBadge size="small" token={option.underlying} />
        </div>
      </div>
      <div>${valueUsd}</div>
      <div>
        <button onClick={handleClick} className="primary active">
          Close
        </button>
      </div>
    </div>
  );
};

const OtmItem = ({ option }: { option: OptionWithPosition }) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.otmitem}`;

  const handleSettle = () => {
    if (!address || !option?.size) {
      return;
    }

    tradeSettle(sendAsync, option).then((res) => {
      if (res?.transaction_hash) {
        afterTransaction(res.transaction_hash, () => {
          invalidatePositions();
        });
      }
    });
  };

  return (
    <div className={className}>
      <div>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size="small"
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>{option.strikeWithCurrency}</div>
      <div className={styles.maturity}>
        <span>{date}</span>
        <span>{time}</span>
      </div>
      <div>{formatNumber(option.size, 4)}</div>
      <div>
        <button onClick={handleSettle} className="primary active">
          Settle
        </button>
      </div>
    </div>
  );
};

const ItmItem = ({ option }: { option: OptionWithPosition }) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const price = useCurrency(option.underlying.id);
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.optionitem}`;

  const handleSettle = () => {
    if (!address || !option?.sizeHex) {
      return;
    }

    tradeSettle(sendAsync, option)
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            showToast("Successfully settled position", ToastType.Success);
          });
        }
      })
      .catch(() => {
        showToast("Failed settling position", ToastType.Error);
      });
  };

  const valueUsd =
    price === undefined ? "--" : (option.value * price).toFixed(2);

  return (
    <div className={className}>
      <div>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size="small"
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>{option.strikeWithCurrency}</div>
      <div className={styles.maturity}>
        <span>{date}</span>
        <span>{time}</span>
      </div>
      <div>{formatNumber(option.size, 4)}</div>
      <div>
        <div className={styles.tokenvalue}>
          <TokenBadge size="small" token={option.underlying} />{" "}
          {formatNumber(option.value, 3)}
        </div>
      </div>
      <div>${valueUsd}</div>
      <div>
        <button onClick={handleSettle} className="primary active">
          Settle
        </button>
      </div>
    </div>
  );
};

export const MyOptionsWithAccount = ({
  state,
}: {
  state: "live" | "itm" | "otm";
}) => {
  const { isLoading, isError, data } = usePositions();

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <span>Something went wrong</span>
      </div>
    );
  }

  const selected =
    state === "live"
      ? data.filter((option) => option.isFresh)
      : state === "itm"
      ? data.filter((option) => option.isInTheMoney)
      : data.filter((option) => option.isOutOfTheMoney);
  const Item =
    state === "live" ? LiveItem : state === "itm" ? ItmItem : OtmItem;

  return (
    <div className={styles.scrollablex}>
      <div className={styles.list}>
        <Header state={state} />
        {selected.map((o, i) => (
          <Item key={i} option={o} />
        ))}
      </div>
    </div>
  );
};

export const MyOptions = ({ state }: { state: "live" | "itm" | "otm" }) => {
  const { account } = useAccount();
  const { openWalletConnectModal } = useConnectWallet();

  if (!account) {
    return (
      <div>
        <button
          className="mainbutton primary active"
          onClick={openWalletConnectModal}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <MyOptionsWithAccount state={state} />;
};
