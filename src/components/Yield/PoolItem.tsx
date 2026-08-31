import { PairNameAboveBadge } from "../TokenBadge";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { useUserPoolStakes } from "../../hooks/useStakes";
import { Button, MajorMinorStacked, TokenAmountStacked } from "../common";
import { LiquidityPool, OptionTypeCall } from "@carmine-options/sdk/core";
import { getPoolSnapshot } from "../../constants/poolSnapshot";
import { formatNumber } from "../../utils/utils";

type Props = {
  pool: LiquidityPool;
};

export const PoolItem = ({ pool }: Props) => {
  const { data: stakes } = useUserPoolStakes(pool.lpAddress);
  const snapshot = getPoolSnapshot(pool.lpAddress);
  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
  };

  const valueOfUserStake = stakes && stakes.value;

  return (
    <div className="w-big py-3 flex text-left justify-between">
      <div className="w-full">
        <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
      </div>
      <div className="w-full">
        <MajorMinorStacked
          major={`${pool.optionType === OptionTypeCall ? "Call" : "Put"} Pool`}
          minor={pool.underlying.symbol}
        />
      </div>
      <div className="w-full">
        <MajorMinorStacked
          major={
            snapshot === undefined
              ? "--"
              : formatNumber(snapshot.lpTokenValue, 4)
          }
          minor={`${pool.underlying.symbol} / LP token`}
        />
      </div>
      <div className="w-full">
        <TokenAmountStacked amount={snapshot?.tvl} token={pool.underlying} />
      </div>
      <div className="w-full">
        <TokenAmountStacked amount={valueOfUserStake} token={pool.underlying} />
      </div>
      <div className="w-full">
        <Button type="primary" className="w-full" onClick={handleClick}>
          {valueOfUserStake === undefined || valueOfUserStake === 0
            ? "View"
            : "Manage"}
        </Button>
      </div>
    </div>
  );
};
