import { PairNameAboveBadge } from "../TokenBadge";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { LoadingAnimation } from "../Loading/Loading";
import { DefispringBadge } from "../Badges";
import { useUserPoolStakes } from "../../hooks/useStakes";
import { useDefispringApy } from "../../hooks/useDefyspringApy";
import { Button, MajorMinorStacked, P3, TokenValueStacked } from "../common";
import { usePoolState } from "../../hooks/usePoolState";
import { LiquidityPool, OptionTypeCall } from "@carmine-options/sdk/core";
import { isDefiEligible } from "../../utils/utils";

type Props = {
  pool: LiquidityPool;
};

export const PoolItem = ({ pool }: Props) => {
  const { data, isLoading, isError } = usePoolState(pool.lpAddress);
  const { defispringApy } = useDefispringApy();
  const { data: stakes } = useUserPoolStakes(pool.lpAddress);
  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
  };
  const isPoolDefiEligible = !isDefiEligible(pool.lpAddress);

  if (isLoading) {
    return (
      <div className="flex text-left justify-between mb-8">
        <div className="flex flex-col g-4">
          <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
          {isPoolDefiEligible && <DefispringBadge />}
        </div>
        <div>
          <LoadingAnimation />
        </div>
        <div></div>
        <div></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex text-left justify-between mb-8">
        <div className="flex flex-col g-4">
          <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
          {isPoolDefiEligible && <DefispringBadge />}
        </div>
        <div>
          <p>Failed getting pool data</p>
        </div>
        <div></div>
        <div></div>
      </div>
    );
  }

  const unlocked = pool.underlying.toHumanReadable(data.unlocked);
  // const locked = shortInteger(state.locked_cap, pool.underlying.decimals);
  const poolPosition = data.position ? data.position.val : 0;
  const tvl = unlocked + poolPosition;

  const finalApy = !isPoolDefiEligible
    ? data.apyAllTime
    : defispringApy === undefined
    ? undefined
    : defispringApy + data.apyAllTime;

  const finalApyWeekly = !isPoolDefiEligible
    ? data.apyWeek
    : defispringApy === undefined
    ? undefined
    : defispringApy + data.apyWeek;

  const valueOfUserStake = stakes && stakes.value;

  return (
    <div className="w-big py-3 flex text-left justify-between">
      <div className="w-full flex flex-col gap-3">
        <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
        {isPoolDefiEligible && <DefispringBadge />}
      </div>
      <div className="w-full">
        <MajorMinorStacked
          major={`${pool.optionType === OptionTypeCall ? "Call" : "Put"} Pool`}
          minor={pool.underlying.symbol}
        />
      </div>
      <div className="w-full">
        {finalApy === undefined ? (
          <LoadingAnimation size={20} />
        ) : (
          <p className={finalApy > 0 ? "text-ui-successBg" : "text-ui-errorBg"}>
            {finalApy.toFixed(2)}%
          </p>
        )}
      </div>

      <div className="w-full">
        {finalApyWeekly === undefined ? (
          <LoadingAnimation size={20} />
        ) : (
          <P3
            className={
              finalApyWeekly > 0 ? "text-ui-successBg" : "text-ui-errorBg"
            }
          >
            {finalApyWeekly.toFixed(2)}%
          </P3>
        )}
      </div>
      <div className="w-full">
        <TokenValueStacked amount={tvl} token={pool.underlying} />
      </div>
      <div className="w-full">
        <TokenValueStacked amount={valueOfUserStake} token={pool.underlying} />
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
