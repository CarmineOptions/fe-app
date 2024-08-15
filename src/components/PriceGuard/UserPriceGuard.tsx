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
  const symbol = option.baseToken.symbol;
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
    <div className={styles.tableitem}>
      <div>{symbol}</div>
      <div>
        {option.size} {symbol}
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

const WithAccount = ({ account }: { account: AccountInterface }) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.position, account.address],
    fetchPositions
  );
  const [asset, setAsset] = useState<TokenKey | "all">("all");

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
        <div className={styles.tableheader}>
          <div>asset</div>
          <div>amount</div>
          <div>price secured</div>
          <div>duration</div>
          <div>status</div>
          <div></div>
        </div>
        {children}
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

  const priceGuard = data.filter((o) => o.isPut && o.isLong);

  const currentChoice =
    asset === "all"
      ? priceGuard
      : priceGuard.filter((o) => o.baseToken.id === asset);

  return (
    <Header>
      <div className={styles.tablecontent}>
        {currentChoice.map((o, i) => (
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
