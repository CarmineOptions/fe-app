import { PairNameAboveBadge } from "../TokenBadge";
import { Pool } from "../../classes/Pool";
import { shortInteger } from "../../utils/computations";
import { math64toDecimal } from "../../utils/units";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { LoadingAnimation } from "../Loading/Loading";
import { DefispringBadge } from "../Badges";
import { useStakes } from "../../hooks/useStakes";
import { useDefispringApy } from "../../hooks/useDefyspringApy";
import { usePoolApy } from "../../hooks/usePoolApy";
import { usePoolState } from "../../hooks/usePoolState";
import { Button, MajorMinorStacked, P3, TokenValueStacked } from "../common";

type Props = {
  pool: Pool;
};

const usePoolData = (pool: Pool) => {
  const {
    apy,
    isLoading: isApyLoading,
    isError: isApyError,
  } = usePoolApy(pool);
  const {
    poolState,
    isLoading: isPoolStateLoading,
    isError: isPoolStateError,
  } = usePoolState(pool);

  if (isApyError || isPoolStateError) {
    return {
      data: undefined,
      isError: true,
      isLoading: false,
    };
  }

  if (isApyLoading || isPoolStateLoading) {
    return {
      data: undefined,
      isError: false,
      isLoading: true,
    };
  }

  if (apy && poolState) {
    return {
      data: { state: poolState, apy },
      isLoading: false,
      isError: false,
    };
  }

  throw Error("Pool state - unreachable");
};

export const PoolItem = ({ pool }: Props) => {
  const { data, isLoading, isError } = usePoolData(pool);
  const { defispringApy } = useDefispringApy();
  const { stakes } = useStakes();
  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
  };

  if (isLoading) {
    return (
      <div className="flex text-left justify-between mb-8">
        <div className="flex flex-col g-4">
          <PairNameAboveBadge
            tokenA={pool.baseToken}
            tokenB={pool.quoteToken}
          />
          {pool.isDefispringEligible && <DefispringBadge />}
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
          <PairNameAboveBadge
            tokenA={pool.baseToken}
            tokenB={pool.quoteToken}
          />
          {pool.isDefispringEligible && <DefispringBadge />}
        </div>
        <div>
          <p>Failed getting pool data</p>
        </div>
        <div></div>
        <div></div>
      </div>
    );
  }

  const { state, apy } = data;

  const unlocked = shortInteger(state.unlocked_cap, pool.underlying.decimals);
  // const locked = shortInteger(state.locked_cap, pool.underlying.decimals);
  const poolPosition = math64toDecimal(state.pool_position);
  const tvl = unlocked + poolPosition;

  const finalApy = !pool.isDefispringEligible
    ? apy.launch_annualized
    : defispringApy === undefined
    ? undefined
    : defispringApy + apy.launch_annualized;

  const finalApyWeekly = !pool.isDefispringEligible
    ? apy.week_annualized
    : defispringApy === undefined
    ? undefined
    : defispringApy + apy.week_annualized;

  const poolData =
    stakes === undefined
      ? undefined
      : stakes.find((p) => p.lpAddress === pool.lpAddress);

  const userPosition =
    stakes === undefined
      ? undefined
      : poolData === undefined // got data and found nothing about this pool
      ? 0
      : poolData.value;

  return (
    <div className="w-big py-3 flex text-left justify-between">
      <div className="w-full flex flex-col gap-3">
        <PairNameAboveBadge tokenA={pool.baseToken} tokenB={pool.quoteToken} />
        {pool.isDefispringEligible && <DefispringBadge />}
      </div>
      <div className="w-full">
        <MajorMinorStacked
          major={`${pool.typeAsText} Pool`}
          minor={pool.underlying.symbol}
        />
      </div>
      <div className="w-full">
        {finalApy === undefined ? (
          <LoadingAnimation size={20} />
        ) : (
          <p className={finalApy > 0 ? "greentext" : "redtext"}>
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
        <TokenValueStacked amount={userPosition} token={pool.underlying} />
      </div>
      <div className="w-full">
        <Button type="primary" className="w-full" onClick={handleClick}>
          {userPosition === undefined || userPosition === 0 ? "View" : "Manage"}
        </Button>
      </div>
    </div>
  );
};
