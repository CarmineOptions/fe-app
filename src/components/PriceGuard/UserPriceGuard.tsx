import { LoadingAnimation } from "../Loading/Loading";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import styles from "./user_priceguard.module.css";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { ReactNode, useState } from "react";
import { TokenKey } from "../../classes/Token";
import { timestampToPriceGuardDate } from "../../utils/utils";

const PriceGuardDisplay = ({ option }: { option: OptionWithPosition }) => {
  const txPending = useTxPending(option.optionId, TransactionAction.TradeClose);
  const symbol = option.baseToken.symbol;
  const [date, time] = timestampToPriceGuardDate(option.maturity);
  const status = option.isFresh
    ? "active"
    : option.isInTheMoney
    ? "claimable"
    : "expired";

  const handleButtonClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
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
          <button onClick={handleButtonClick}>Claim</button>
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
          <PriceGuardDisplay option={o} key={i} />
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
