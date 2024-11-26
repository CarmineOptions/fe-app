import { useAccount, useSendTransaction } from "@starknet-react/core";
import toast from "react-hot-toast";

import { LoadingAnimation } from "../Loading/Loading";
import { OptionWithPosition } from "../../classes/Option";
import { PairNameAboveBadge } from "../TokenBadge";
import { formatNumber } from "../../utils/utils";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";
import { tradeSettle } from "../../calls/tradeSettle";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";
import { usePositions } from "../../hooks/usePositions";
import {
  Button,
  MaturityStacked,
  P3,
  P4,
  SideTypeStacked,
  TokenValueStacked,
} from "../common";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";

const Header = () => {
  return (
    <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
      <div className="w-full">
        <P4 className="text-dark-secondary">PAIR</P4>
      </div>
      <div className="w-full">
        <P4 className="text-dark-secondary">
          SIDE <span className="text-dark-primary">/ TYPE</span>
        </P4>
      </div>
      <div className="w-full">
        <P4 className="text-dark-secondary">STRIKE</P4>
      </div>
      <div className="w-full">
        <P4 className="text-dark-secondary">MATURITY</P4>
      </div>
      <div className="w-full">
        <P4 className="text-dark-secondary">SIZE</P4>
      </div>
      <div className="w-full">
        <P4 className="text-dark-secondary">VALUE</P4>
      </div>
      {/* Empty room for button */}
      <div className="w-full" />
    </div>
  );
};

const LiveItem = ({ option }: { option: OptionWithPosition }) => {
  const handleClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };
  return (
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <PairNameAboveBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
        />
      </div>
      <div className="w-full">
        <SideTypeStacked side={option.side} type={option.type} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{option.strikeWithCurrency}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={option.maturity} />
      </div>
      <div className="w-full">{formatNumber(option.size, 4)}</div>
      <div className="w-full">
        <TokenValueStacked amount={option.value} token={option.underlying} />
      </div>
      <div className="w-full">
        <Button className="w-full" type="primary" onClick={handleClick}>
          Close
        </Button>
      </div>
    </div>
  );
};

const OtmItem = ({ option }: { option: OptionWithPosition }) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();

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
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <PairNameAboveBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
        />
      </div>
      <div className="w-full">
        <SideTypeStacked side={option.side} type={option.type} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{option.strikeWithCurrency}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={option.maturity} />
      </div>
      <div className="w-full">{formatNumber(option.size, 4)}</div>
      <div className="w-full">0</div>
      <div className="w-full">
        <Button className="w-full" type="primary" onClick={handleSettle}>
          Settle
        </Button>
      </div>
    </div>
  );
};

const ItmItem = ({ option }: { option: OptionWithPosition }) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();

  const handleSettle = () => {
    if (!address || !option?.sizeHex) {
      return;
    }

    tradeSettle(sendAsync, option)
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            toast.success("Successfully settled position");
          });
        }
      })
      .catch(() => {
        toast.error("Failed settling position");
      });
  };

  return (
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <PairNameAboveBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
        />
      </div>
      <div className="w-full">
        <SideTypeStacked side={option.side} type={option.type} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{option.strikeWithCurrency}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={option.maturity} />
      </div>
      <div className="w-full">{formatNumber(option.size, 4)}</div>
      <div className="w-full">
        <TokenValueStacked amount={option.value} token={option.underlying} />
      </div>
      <div className="w-full">
        <Button className="w-full" type="primary" onClick={handleSettle}>
          Settle
        </Button>
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
    <div className="flex flex-col gap-3 overflow-x-auto">
      <Header />
      {selected.length === 0 ? (
        <div className="my-2 py-3 max-w-big">
          <P3 className="font-semibold text-center">Nothing to show</P3>
        </div>
      ) : (
        selected.map((o, i) => <Item key={i} option={o} />)
      )}
    </div>
  );
};

export const MyOptions = ({ state }: { state: "live" | "itm" | "otm" }) => {
  const { account } = useAccount();

  if (!account) {
    return <SecondaryConnectWallet msg="Connect wallet to see your options." />;
  }

  return <MyOptionsWithAccount state={state} />;
};
