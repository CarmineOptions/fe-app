import { LoadingAnimation } from "../Loading/Loading";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { showToast } from "../../redux/actions";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import styles from "./user_priceguard.module.css";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { ReactNode, useState } from "react";
import { TokenKey } from "../../classes/Token";
import { timestampToPriceGuardDate } from "../../utils/utils";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";
import { ToastType } from "../../redux/reducers/ui";
import { ReactComponent as ArrowIcon } from "./arrow.svg";
import { TokenNamedBadge } from "../TokenBadge/Badge";

const PriceGuardDisplay = ({
  option,
  account,
}: {
  option: OptionWithPosition;
  account: AccountInterface;
}) => {
  const txPending = useTxPending(
    option.optionId,
    TransactionAction.TradeSettle
  );
  const [_settling, setSettling] = useState(false);
  const token = option.baseToken;
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const status = option.isFresh
    ? "active"
    : option.isInTheMoney
    ? "claimable"
    : "expired";

  const settling = txPending || _settling;

  const handleButtonClick = () => {
    setSettling(true);
    account
      .execute(option.tradeSettleCalldata)
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            showToast("Successfully claimed Price Protect", ToastType.Success);
            setSettling(false);
          });
        }
      })
      .catch(() => {
        showToast("Failed claiming Price Protect", ToastType.Error);
        setSettling(false);
      });
  };
  return (
    <div className="tableitem">
      <div>
        <TokenNamedBadge token={token} size={21} />
      </div>
      <div>
        {option.size} {token.symbol}
      </div>
      <div>${option.strike}</div>
      <div className={styles.datetime}>
        <div>
          <span>{date}</span>
          <span>{time}</span>
        </div>
      </div>
      <div className={styles[status]}>{status}</div>
      <div>
        {status === "claimable" && (
          <button
            disabled={settling}
            className={styles.active}
            onClick={handleButtonClick}
          >
            {settling ? (
              <div className={styles.loading}>
                <LoadingAnimation size={13} />
              </div>
            ) : (
              "Claim"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

type Sorter = "asset" | "amount" | "price" | "duration" | "status";

const WithAccount = ({ account }: { account: AccountInterface }) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.position, account.address],
    fetchPositions
  );
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

  const sort = (opts: OptionWithPosition[]): OptionWithPosition[] => {
    if (sortBy === "asset") {
      return opts.sort((a, b) => {
        const res =
          a.baseToken.symbol.toLowerCase() < b.baseToken.symbol.toLowerCase();
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
        order === "asc" ? a.size - b.size : b.size - a.size
      );
    }
    if (sortBy === "price") {
      return opts.sort((a, b) =>
        order === "asc" ? a.strike - b.strike : b.strike - a.strike
      );
    }
    if (sortBy === "duration") {
      return opts.sort((a, b) =>
        order === "asc" ? a.maturity - b.maturity : b.maturity - a.maturity
      );
    }
    if (sortBy === "status") {
      const optionToStatusValue = (o: OptionWithPosition) => {
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
      <div className={styles.wrapper}>
        <h3>My Price Protect</h3>
        <div className={styles.buttons}>
          <button
            className={asset === "all" ? styles.active : ""}
            onClick={() => setAsset("all")}
          >
            All
          </button>
          <button
            className={asset === TokenKey.STRK ? styles.active : ""}
            onClick={() => setAsset(TokenKey.STRK)}
          >
            STRK
          </button>
          <button
            className={asset === TokenKey.ETH ? styles.active : ""}
            onClick={() => setAsset(TokenKey.ETH)}
          >
            ETH
          </button>
          <button
            className={asset === TokenKey.BTC ? styles.active : ""}
            onClick={() => setAsset(TokenKey.BTC)}
          >
            wBTC
          </button>
        </div>
        <div className={styles.outer}>
          <div className={styles.inner}>
            <div className="tableheader">
              <div
                onClick={() => handleSortClick("asset")}
                style={{ cursor: "pointer" }}
              >
                asset{" "}
                <div
                  className={
                    sortBy === "asset"
                      ? `${styles.arrowcontainer} ${styles[order]}`
                      : styles.arrowcontainer
                  }
                >
                  <ArrowIcon />
                  <ArrowIcon />
                </div>
              </div>
              <div
                onClick={() => handleSortClick("amount")}
                style={{ cursor: "pointer" }}
              >
                amount{" "}
                <div
                  className={
                    sortBy === "amount"
                      ? `${styles.arrowcontainer} ${styles[order]}`
                      : styles.arrowcontainer
                  }
                >
                  <ArrowIcon />
                  <ArrowIcon />
                </div>
              </div>
              <div
                onClick={() => handleSortClick("price")}
                style={{ cursor: "pointer" }}
              >
                price secured{" "}
                <div
                  className={
                    sortBy === "price"
                      ? `${styles.arrowcontainer} ${styles[order]}`
                      : styles.arrowcontainer
                  }
                >
                  <ArrowIcon />
                  <ArrowIcon />
                </div>
              </div>
              <div
                onClick={() => handleSortClick("duration")}
                style={{ cursor: "pointer" }}
              >
                duration{" "}
                <div
                  className={
                    sortBy === "duration"
                      ? `${styles.arrowcontainer} ${styles[order]}`
                      : styles.arrowcontainer
                  }
                >
                  <ArrowIcon />
                  <ArrowIcon />
                </div>
              </div>
              <div
                onClick={() => handleSortClick("status")}
                style={{ cursor: "pointer" }}
              >
                status{" "}
                <div
                  className={
                    sortBy === "status"
                      ? `${styles.arrowcontainer} ${styles[order]}`
                      : styles.arrowcontainer
                  }
                >
                  <ArrowIcon />
                  <ArrowIcon />
                </div>
              </div>
              <div></div>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

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
      : priceGuard.filter((o) => o.baseToken.id === asset);

  const sorted = sort(currentChoice);

  return (
    <Header>
      <div className="tablecontent">
        {sorted.map((o, i) => (
          <PriceGuardDisplay option={o} account={account} key={i} />
        ))}
      </div>
    </Header>
  );
};

export const UserPriceGuard = () => {
  const account = useAccount();

  if (!account) {
    return (
      <div className={styles.wrapper}>
        <h3>My Price Protect</h3>
        <p>Connect your wallet to voew active & claimable Price Protections</p>
        <button onClick={openWalletConnectDialog}>Connect Wallet</button>
      </div>
    );
  }

  return <WithAccount account={account} />;
};
