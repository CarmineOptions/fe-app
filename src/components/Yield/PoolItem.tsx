import { PairBadge } from "../TokenBadge";
import { Pool } from "../../classes/Pool";
import { shortInteger } from "../../utils/computations";
import { useCurrency } from "../../hooks/useCurrency";
import { math64toDecimal } from "../../utils/units";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { LoadingAnimation } from "../Loading/Loading";
import { TokenKey } from "../../classes/Token";
import { DefispringBadge } from "../Badges";
import { formatNumber } from "../../utils/utils";
import { useStakes } from "../../hooks/useStakes";
import styles from "./pooltable.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useDefispringApy } from "../../hooks/useDefyspringApy";
import { usePoolApy } from "../../hooks/usePoolApy";
import { usePoolState } from "../../hooks/usePoolState";

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
  const isWideScreen = !useIsMobile();
  const { stakes } = useStakes();
  const price = useCurrency(pool.underlying.id);
  const isDefispringPool =
    pool.baseToken.id !== TokenKey.BTC && pool.quoteToken.id !== TokenKey.BTC;

  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
  };

  if (isLoading) {
    return (
      <div className={styles.item}>
        <div className={styles.pooldesc}>
          <div>
            <p>
              {pool.baseToken.symbol}/{pool.quoteToken.symbol}
            </p>
            <PairBadge
              tokenA={pool.baseToken}
              tokenB={pool.quoteToken}
              size="small"
            />
          </div>
          {isDefispringPool && <DefispringBadge />}
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
      <div className={styles.item}>
        <div className={styles.pooldesc}>
          <div>
            <p>
              {pool.baseToken.symbol}/{pool.quoteToken.symbol}
            </p>
            <PairBadge
              tokenA={pool.baseToken}
              tokenB={pool.quoteToken}
              size="small"
            />
          </div>
          {isDefispringPool && <DefispringBadge />}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const locked = shortInteger(state.locked_cap, pool.underlying.decimals);
  const poolPosition = math64toDecimal(state.pool_position);
  const tvl = unlocked + poolPosition;

  const finalApy = !isDefispringPool
    ? apy.launch_annualized
    : defispringApy === undefined
    ? undefined
    : defispringApy + apy.launch_annualized;

  const finalApyWeekly = !isDefispringPool
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

  const isDefispring =
    pool.baseToken.id !== TokenKey.BTC && pool.quoteToken.id !== TokenKey.BTC;

  return (
    <div className={styles.item + " " + styles.itemmobilesize}>
      <div className={styles.pooldesc}>
        <div>
          <p>
            {pool.baseToken.symbol}/<wbr />
            {pool.quoteToken.symbol}
          </p>
          <PairBadge
            tokenA={pool.baseToken}
            tokenB={pool.quoteToken}
            size="small"
          />
        </div>
        {isDefispring && <DefispringBadge />}
      </div>
      <div>
        <p>{pool.typeAsText} Pool</p>
        <p className="p4 secondary-col">{pool.underlying.symbol}</p>
      </div>
      <div>
        {finalApy === undefined ? (
          <LoadingAnimation size={20} />
        ) : (
          <p className={finalApy > 0 ? "greentext" : "redtext"}>
            {finalApy.toFixed(2)}%
          </p>
        )}
      </div>
      {isWideScreen && (
        <div>
          {finalApyWeekly === undefined ? (
            <LoadingAnimation size={20} />
          ) : (
            <p className={finalApyWeekly > 0 ? "greentext" : "redtext"}>
              {finalApyWeekly.toFixed(2)}%
            </p>
          )}
        </div>
      )}
      {isWideScreen && (
        <div>
          <div>
            {price === undefined ? (
              <LoadingAnimation size={20} />
            ) : (
              <p>${formatNumber(tvl * price)}</p>
            )}
            <p className="p4 secondary-col">
              {formatNumber(tvl)} {pool.underlying.symbol}
            </p>
          </div>
        </div>
      )}
      <div>
        <div>
          {price === undefined ||
          userPosition === undefined ||
          userPosition === 0 ? (
            <p>-</p>
          ) : (
            <p>${formatNumber(userPosition * price)}</p>
          )}
          {userPosition === undefined || userPosition === 0 ? (
            <p>- {pool.underlying.symbol}</p>
          ) : (
            <p className="p4 secondary-col">
              {formatNumber(userPosition)} {pool.underlying.symbol}
            </p>
          )}
        </div>
      </div>
      <div>
        <button onClick={handleClick} className="primary active mainbutton">
          {userPosition === undefined || userPosition === 0 ? "View" : "Manage"}
        </button>
      </div>
    </div>
  );
};
