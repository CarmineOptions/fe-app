import { useAccount } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./portfolio.module.css";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";
import { UserPoolInfo } from "../../classes/Pool";
import { useCurrency } from "../../hooks/useCurrency";
import { useStakes } from "../../hooks/useStakes";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { formatNumber } from "../../utils/utils";
import { useConnectWallet } from "../../hooks/useConnectWallet";

const Item = ({ stake }: { stake: UserPoolInfo }) => {
  const price = useCurrency(stake.underlying.id);
  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={stake} initialAction="withdraw" />);
    openSidebar();
  };

  const valueUsd = price === undefined ? undefined : stake.value * price;

  return (
    <div className={styles.stakeitem}>
      <div>
        <PairNamedBadge
          tokenA={stake.baseToken}
          tokenB={stake.quoteToken}
          size="small"
        />
      </div>
      <div>{stake.typeAsText}</div>
      <div className={styles.tokenvalue}>
        {formatNumber(stake.value, 3)}
        <TokenBadge size="small" token={stake.underlying} />
      </div>
      <div>${valueUsd === undefined ? "--" : formatNumber(valueUsd, 2)}</div>
      <div>
        <button onClick={handleClick} className="primary active">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export const MyStakeWithAccount = () => {
  const { isLoading, isError, stakes } = useStakes();

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  if (isError || !stakes) {
    return (
      <div>
        <span>Something went wrong</span>
      </div>
    );
  }

  return (
    <div className={styles.scrollablex}>
      <div className={styles.list}>
        <div className={`${styles.header} ${styles.stakeitem}`}>
          <div>Pair</div>
          <div>Type</div>
          <div>Value</div>
          <div>Value $</div>
          <div></div>
        </div>
        {stakes.map((stake, i) => (
          <Item key={i} stake={stake} />
        ))}
      </div>
    </div>
  );
};

export const MyStake = () => {
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

  return <MyStakeWithAccount />;
};
