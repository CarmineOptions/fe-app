import { LoadingAnimation } from "../Loading/Loading";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import { ReactNode, useState } from "react";
import { TokenKey } from "../../classes/Token";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";
import ArrowIcon from "./arrow.svg?react";
import { TokenNamedBadge } from "../TokenBadge/Badge";
import { usePositions } from "../../hooks/usePositions";
import toast from "react-hot-toast";
import { Button, MaturityStacked, P3, P4 } from "../common";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { OptionWithUserPosition } from "@carmine-options/sdk/core";

const PriceGuardDisplay = ({ option }: { option: OptionWithUserPosition }) => {
  const { sendAsync } = useSendTransaction({});
  const txPending = useTxPending(
    option.optionId,
    TransactionAction.TradeSettle
  );
  const [_settling, setSettling] = useState(false);
  const token = option.base;

  const settling = txPending || _settling;

  const handleButtonClick = () => {
    setSettling(true);
    sendAsync([option.tradeSettle()])
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            toast.success("Successfully claimed Price Protect");
            setSettling(false);
          });
        }
      })
      .catch(() => {
        toast.error("Failed claiming Price Protect");
        setSettling(false);
      });
  };

  return (
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <TokenNamedBadge token={option.base} size="small" />
      </div>
      <div className="w-full">
        <P3>
          {option.underlying.toHumanReadable(option.size)} {token.symbol}
        </P3>
      </div>
      <div className="w-full">
        <P3>${option.strikePrice.val}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={option.maturity} />
      </div>
      <div className="w-full">
        {option.isFresh && (
          <P3 className="font-semibold text-ui-successBg">ACTIVE</P3>
        )}
        {option.isInTheMoney && (
          <P3 className="font-semibold text-brand">CLAIMABLE</P3>
        )}
        {option.isOutOfTheMoney && (
          <P3 className="font-semibold text-ui-neutralBg">EXPIRED</P3>
        )}
      </div>
      <div className="w-full">
        {settling ? (
          <Button disabled type="dark" className="w-full h-8">
            <LoadingAnimation size={13} />
          </Button>
        ) : (
          (option.isInTheMoney || option.isOutOfTheMoney) && (
            <Button
              disabled={settling}
              type={option.isInTheMoney ? "primary" : "dark"}
              className="w-full h-8 normal-case"
              onClick={handleButtonClick}
            >
              {option.isInTheMoney ? "Claim" : "Remove"}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

type Sorter = "asset" | "amount" | "price" | "duration" | "status";

export const UserPriceGuard = () => {
  const { data, isLoading, isError } = usePositions();
  const { address } = useAccount();
  const [asset, setAsset] = useState<TokenKey | "all">("all");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<Sorter | undefined>();

  const toggleOrder = () => setOrder(order === "asc" ? "desc" : "asc");
  const handleSortClick = (sorter: Sorter) => {
    if (sorter === sortBy) {
      return toggleOrder();
    }
    setSortBy(sorter);
    setOrder("asc");
  };

  const sort = (opts: OptionWithUserPosition[]): OptionWithUserPosition[] => {
    if (sortBy === "asset") {
      return opts.sort((a, b) => {
        const res = a.base.symbol.toLowerCase() < b.base.symbol.toLowerCase();
        if (order === "asc") {
          if (res) {
            return -1;
          } else {
            return 1;
          }
        }
        if (res) {
          return 1;
        } else {
          return -1;
        }
      });
    }
    if (sortBy === "amount") {
      return opts.sort((a, b) =>
        order === "asc" ? a.sizeHuman - b.sizeHuman : b.sizeHuman - a.sizeHuman
      );
    }
    if (sortBy === "price") {
      return opts.sort((a, b) =>
        order === "asc"
          ? a.strikePrice.val - b.strikePrice.val
          : b.strikePrice.val - a.strikePrice.val
      );
    }
    if (sortBy === "duration") {
      return opts.sort((a, b) =>
        order === "asc" ? a.maturity - b.maturity : b.maturity - a.maturity
      );
    }
    if (sortBy === "status") {
      const optionToStatusValue = (o: OptionWithUserPosition) => {
        if (o.isFresh) {
          return 2;
        }
        if (o.isInTheMoney) {
          return 1;
        }
        return 0;
      };
      return opts.sort((a, b) =>
        order === "asc"
          ? optionToStatusValue(a) - optionToStatusValue(b)
          : optionToStatusValue(b) - optionToStatusValue(a)
      );
    }
    return opts;
  };

  const Header = ({ children }: { children: ReactNode }) => {
    return (
      <div className="flex flex-col gap-3">
        {!address && (
          <SecondaryConnectWallet msg="Your purchased protections will be visible here." />
        )}
        <div className="flex gap-1">
          <Button
            type="secondary"
            outlined={asset !== "all"}
            onClick={() => setAsset("all")}
          >
            All
          </Button>
          <Button
            type="secondary"
            outlined={asset !== TokenKey.STRK}
            onClick={() => setAsset(TokenKey.STRK)}
          >
            STRK
          </Button>
          <Button
            type="secondary"
            outlined={asset !== TokenKey.ETH}
            onClick={() => setAsset(TokenKey.ETH)}
          >
            ETH
          </Button>
          <Button
            type="secondary"
            outlined={asset !== TokenKey.BTC}
            onClick={() => setAsset(TokenKey.BTC)}
          >
            wBTC
          </Button>
        </div>
        <div className="w-ful overflow-x-auto">
          <div className="flex flex-col text-left gap-5 min-w-big overflow-hidden">
            <div className="flex justify-between py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
              <div className="w-full">
                <P4
                  onClick={() => handleSortClick("asset")}
                  className="text-dark-secondary cursor-pointer flex gap-2 w-fit pr-2"
                >
                  ASSET{" "}
                  <span className="flex flex-col justify-center gap-1 pb-1">
                    <ArrowIcon
                      className={
                        sortBy === "asset" && order === "asc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }
                    />
                    <ArrowIcon
                      className={`rotate-180 ${
                        sortBy === "asset" && order === "desc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }`}
                    />
                  </span>
                </P4>
              </div>
              <div className="w-full">
                <P4
                  onClick={() => handleSortClick("amount")}
                  className="text-dark-secondary cursor-pointer flex gap-2 w-fit pr-2"
                >
                  AMOUNT SECURED{" "}
                  <span className="flex flex-col justify-center gap-1 pb-1">
                    <ArrowIcon
                      className={
                        sortBy === "amount" && order === "asc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }
                    />
                    <ArrowIcon
                      className={`rotate-180 ${
                        sortBy === "amount" && order === "desc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }`}
                    />
                  </span>
                </P4>
              </div>
              <div className="w-full">
                <P4
                  onClick={() => handleSortClick("price")}
                  className="text-dark-secondary cursor-pointer flex gap-2 w-fit pr-2"
                >
                  PRICE SECURED{" "}
                  <span className="flex flex-col justify-center gap-1 pb-1">
                    <ArrowIcon
                      className={
                        sortBy === "price" && order === "asc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }
                    />
                    <ArrowIcon
                      className={`rotate-180 ${
                        sortBy === "price" && order === "desc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }`}
                    />
                  </span>
                </P4>
              </div>
              <div className="w-full">
                <P4
                  onClick={() => handleSortClick("duration")}
                  className="text-dark-secondary cursor-pointer flex gap-2 w-fit pr-2"
                >
                  DURATION{" "}
                  <span className="flex flex-col justify-center gap-1 pb-1">
                    <ArrowIcon
                      className={
                        sortBy === "duration" && order === "asc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }
                    />
                    <ArrowIcon
                      className={`rotate-180 ${
                        sortBy === "duration" && order === "desc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }`}
                    />
                  </span>
                </P4>
              </div>
              <div className="w-full">
                <P4
                  onClick={() => handleSortClick("status")}
                  className="text-dark-secondary cursor-pointer flex gap-2 w-fit pr-2"
                >
                  STATUS{" "}
                  <span className="flex flex-col justify-center gap-1 pb-1">
                    <ArrowIcon
                      className={
                        sortBy === "status" && order === "asc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }
                    />
                    <ArrowIcon
                      className={`rotate-180 ${
                        sortBy === "status" && order === "desc"
                          ? "fill-brand"
                          : "fill-dark-secondary"
                      }`}
                    />
                  </span>
                </P4>
              </div>
              {/* Empty room for button */}
              <div className="w-full" />
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (!address) {
    return <Header>{null}</Header>;
  }

  if (isLoading) {
    return (
      <Header>
        <LoadingAnimation />
      </Header>
    );
  }

  if (isError || !data) {
    return (
      <Header>
        <p>Something went wrong, please try again</p>
      </Header>
    );
  }

  const priceGuard = data.filter(
    (o) => o.isPut && o.isLong && (o.isFresh || o.isInTheMoney)
  );

  const currentChoice =
    asset === "all"
      ? priceGuard
      : priceGuard.filter((o) => o.base.symbol === asset);

  const sorted = sort(currentChoice);

  return (
    <Header>
      {sorted.length === 0 ? (
        <div className="my-2 py-3 max-w-big">
          <P3 className="font-semibold text-center">Nothing to show</P3>
        </div>
      ) : (
        sorted.map((o, i) => <PriceGuardDisplay option={o} key={i} />)
      )}
    </Header>
  );
};
