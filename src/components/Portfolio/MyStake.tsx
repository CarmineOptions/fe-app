import { AccountInterface } from "starknet";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { useAccount } from "../../hooks/useAccount";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./portfolio.module.css";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";
import { maxDecimals } from "../../utils/utils";
import { UserPoolInfo } from "../../classes/Pool";
import { useCurrency } from "../../hooks/useCurrency";
import { useStakes } from "../../hooks/useStakes";

const Item = ({
  account,
  stake,
}: {
  account: AccountInterface;
  stake: UserPoolInfo;
}) => {
  const price = useCurrency(stake.underlying.id);
  const handleClick = () => {};

  const valueUsd = price === undefined ? undefined : stake.value * price;

  return (
    <div className={styles.stakeitem}>
      <div>
        <PairNamedBadge
          tokenA={stake.baseToken}
          tokenB={stake.quoteToken}
          size={25}
        />
      </div>
      <div>{stake.typeAsText}</div>
      <div>{maxDecimals(stake.size, 4)}</div>
      <div className={styles.tokenvalue}>
        <TokenBadge size={25} token={stake.underlying} />{" "}
        {maxDecimals(stake.value, 3)}
      </div>
      <div>${valueUsd === undefined ? "--" : maxDecimals(valueUsd, 2)}</div>
      <div>
        <button onClick={handleClick} disabled className="disabled">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export const MyStakeWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const { isLoading, isError, data } = useStakes();

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

  return (
    <div className={styles.list}>
      <div className={`${styles.header} ${styles.stakeitem}`}>
        <div>Pair</div>
        <div>Type</div>
        <div>Size</div>
        <div>Value</div>
        <div>Value $</div>
        <div></div>
      </div>
      {data.map((stake, i) => (
        <Item key={i} stake={stake} account={account} />
      ))}
    </div>
  );
};

export const MyStake = () => {
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

  return <MyStakeWithAccount account={account} />;
};
