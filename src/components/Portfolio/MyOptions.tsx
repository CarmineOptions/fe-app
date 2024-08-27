import { AccountInterface } from "starknet";
import { QueryKeys } from "../../queries/keys";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { useAccount } from "../../hooks/useAccount";
import { useQuery } from "react-query";
import { LoadingAnimation } from "../Loading/Loading";
import { OptionWithPosition } from "../../classes/Option";

import styles from "./portfolio.module.css";
import { PairNamedBadge } from "../TokenBadge";
import { maxDecimals, timestampToPriceGuardDate } from "../../utils/utils";
import {
  openCloseOptionDialog,
  setCloseOption,
  showToast,
} from "../../redux/actions";
import { tradeSettle } from "../../calls/tradeSettle";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";
import { ToastType } from "../../redux/reducers/ui";

const Header = ({ state }: { state: "live" | "itm" | "otm" }) => {
  return (
    <div className={`${styles.header} ${styles.item} ${styles[state]}`}>
      <div>Pair</div>
      <div>Side</div>
      <div>Type</div>
      <div>Strike</div>
      <div>Date</div>
      <div>Time</div>
      <div>Size</div>
      {(state === "live" || state === "itm") && <div>Value</div>}
      <div></div>
    </div>
  );
};

const LiveItem = ({
  account,
  option,
}: {
  account: AccountInterface;
  option: OptionWithPosition;
}) => {
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.optionitem}`;

  const handleClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };

  return (
    <div className={className}>
      <div>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size={25}
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>${option.strike}</div>
      <div>{date}</div>
      <div>{time}</div>
      <div>{maxDecimals(option.size, 4)}</div>
      <div>{maxDecimals(option.value, 3)}</div>
      <div>
        <button onClick={handleClick} className="primary active">
          Close
        </button>
      </div>
    </div>
  );
};

const OtmItem = ({
  account,
  option,
}: {
  account: AccountInterface;
  option: OptionWithPosition;
}) => {
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.otmitem}`;

  const handleSettle = () => {
    if (!account || !option?.size) {
      return;
    }

    tradeSettle(account, option).then((res) => {
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
          size={25}
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>${option.strike}</div>
      <div>{date}</div>
      <div>{time}</div>
      <div>{maxDecimals(option.size, 4)}</div>
      <div>
        <button onClick={handleSettle} className="primary active">
          Settle
        </button>
      </div>
    </div>
  );
};

const ItmItem = ({
  account,
  option,
}: {
  account: AccountInterface;
  option: OptionWithPosition;
}) => {
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const className = `${styles.item} ${styles.optionitem}`;

  const handleSettle = () => {
    if (!account || !option?.sizeHex) {
      return;
    }

    tradeSettle(account, option)
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

  return (
    <div className={className}>
      <div>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size={25}
        />
      </div>
      <div>{option.sideAsText}</div>
      <div>{option.typeAsText}</div>
      <div>${option.strike}</div>
      <div>{date}</div>
      <div>{time}</div>
      <div>{maxDecimals(option.size, 4)}</div>
      <div>{maxDecimals(option.value, 3)}</div>
      <div>
        <button onClick={handleSettle} className="primary active">
          Settle
        </button>
      </div>
    </div>
  );
};

export const MyOptionsWithAccount = ({
  account,
  state,
}: {
  account: AccountInterface;
  state: "live" | "itm" | "otm";
}) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.position, account.address],
    fetchPositions
  );

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
    <div className={styles.list}>
      <Header state={state} />
      {selected.map((o, i) => (
        <Item key={i} option={o} account={account} />
      ))}
    </div>
  );
};

export const MyOptions = ({ state }: { state: "live" | "itm" | "otm" }) => {
  const account = useAccount();

  if (!account) {
    return (
      <div>
        <button
          className="mainbutton primary active"
          onClick={openWalletConnectDialog}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <MyOptionsWithAccount account={account} state={state} />;
};
