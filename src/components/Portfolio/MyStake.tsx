import { useAccount } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";

import { PairNameAboveBadge } from "../TokenBadge";
import { useStakes } from "../../hooks/useStakes";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import {
  Button,
  MajorMinorStacked,
  P3,
  P4,
  TokenValueStacked,
} from "../common";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import {
  liquidityPoolByLpAddress,
  UserPoolInfo,
} from "@carmine-options/sdk/core";

const Item = ({ stake }: { stake: UserPoolInfo }) => {
  const pool = liquidityPoolByLpAddress(stake.lpAddress).unwrap();

  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} initialAction="withdraw" />);
    openSidebar();
  };

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[550px]">
      <div className="w-full">
        <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
      </div>
      <div className="w-full">
        <MajorMinorStacked
          major={`${pool.typeAsText} Pool`}
          minor={pool.underlying.symbol}
        />
      </div>
      <div className="w-full">
        <TokenValueStacked amount={stake.value} token={pool.underlying} />
      </div>
      <div className="w-full">
        <Button type="primary" className="w-full" onClick={handleClick}>
          Withdraw
        </Button>
      </div>
    </div>
  );
};

export const MyStakeWithAccount = () => {
  const { isLoading, isError, data: stakes } = useStakes();

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
    <div className="overflow-x-auto">
      <div className="flex flex-col g-3 w-[550px]">
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
          <div className="my-2 py-3 max-w-big">
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
  const { address } = useAccount();

  if (!address) {
    return <SecondaryConnectWallet msg="Connect wallet to see your stakes." />;
  }

  return <MyStakeWithAccount />;
};
