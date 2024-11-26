import { useAccount } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./portfolio.module.css";
import { PairNameAboveBadge } from "../TokenBadge";
import { UserPoolInfo } from "../../classes/Pool";
import { useStakes } from "../../hooks/useStakes";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { Button, P3, P4, TokenValueStacked } from "../common";

const Item = ({ stake }: { stake: UserPoolInfo }) => {
  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={stake} initialAction="withdraw" />);
    openSidebar();
  };

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[550px]">
      <div className="w-full">
        <PairNameAboveBadge
          tokenA={stake.baseToken}
          tokenB={stake.quoteToken}
        />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{stake.typeAsText.toUpperCase()}</P3>
      </div>
      <div className="w-full">
        <TokenValueStacked amount={stake.value} token={stake.underlying} />
      </div>
      <div className="w-full">
        <Button type="primary" onClick={handleClick}>
          Withdraw
        </Button>
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
        <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[550px]">
          <div className="w-full">
            <P4 className="text-dark-secondary">PAIR</P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">TYPE</P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">VALUE</P4>
          </div>
          {/* Empty room for button */}
          <div className="w-full" />
        </div>
        {stakes.length === 0 ? (
          <div className="my-2 py-3 max-w-[880px]">
            <P3 className="font-semibold text-center">Nothing to show</P3>
          </div>
        ) : (
          stakes.map((stake, i) => <Item key={i} stake={stake} />)
        )}
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
