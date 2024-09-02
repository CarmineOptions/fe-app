import { useQuery } from "react-query";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";
import { queryDefiSpringApy, queryPoolCapital } from "./fetchStakeCapital";
import { Pool } from "../../classes/Pool";

import styles from "./pool.module.css";
import { shortInteger } from "../../utils/computations";
import { useCurrency } from "../../hooks/useCurrency";
import { math64toDecimal } from "../../utils/units";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "../Sidebar";
import { LoadingAnimation } from "../Loading/Loading";
import { QueryKeys } from "../../queries/keys";
import { TokenKey } from "../../classes/Token";
import { DefiSpringStakingMessage, DefiSpringTooltip } from "../DefiSpring";
import { BoxTwoValues } from "../Sidebar/Utils";
import { formatNumber } from "../../utils/utils";

type Props = {
  pool: Pool;
};

export const PoolCard = ({ pool }: Props) => {
  const { isLoading, isError, data } = useQuery(
    [`pool-data-${pool.apiPoolId}`, pool.apiPoolId],
    queryPoolCapital
  );
  const { data: defispringApy } = useQuery(
    [QueryKeys.defispringApy],
    queryDefiSpringApy
  );
  const price = useCurrency(pool.underlying.id);

  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
  };

  if (isLoading) {
    return (
      <div className={styles.container} style={{ height: "410px" }}>
        <div className={styles.desc} style={{ padding: "20px" }}>
          <PairNamedBadge
            tokenA={pool.baseToken}
            tokenB={pool.quoteToken}
            size={32}
          />
          <div className={styles.poolid}>
            <TokenBadge token={pool.underlying} size={15} />{" "}
            {pool.typeAsText.toUpperCase()} POOL
          </div>
          <div className={styles.asset}>
            <span>ASSET</span>
            <span>{pool.underlying.symbol}</span>
          </div>
        </div>
        <div
          className={styles.content}
          style={{ padding: "20px", height: "100%" }}
        >
          <LoadingAnimation size={85} />
        </div>
        <div className={styles.button}>
          <button onClick={handleClick} className="primary active">
            View Details
          </button>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.container} style={{ height: "410px" }}>
        <div className={styles.desc} style={{ padding: "20px" }}>
          <PairNamedBadge
            tokenA={pool.baseToken}
            tokenB={pool.quoteToken}
            size={32}
          />
          <div className={styles.poolid}>
            <TokenBadge token={pool.underlying} size={15} />{" "}
            {pool.typeAsText.toUpperCase()} POOL
          </div>
          <div className={styles.asset}>
            <span>ASSET</span>
            <span>{pool.underlying.symbol}</span>
          </div>
        </div>
        <div
          className={styles.content}
          style={{ padding: "20px", height: "100%" }}
        >
          <h4>Something went wrong</h4>
          <span>Loading pool state failed. Please try again later.</span>
        </div>
        <div className={styles.button}>
          <button onClick={handleClick} className="primary active">
            View Details
          </button>
        </div>
      </div>
    );
  }

  const { state, apy } = data;

  const unlocked = shortInteger(state.unlocked_cap, pool.underlying.decimals);
  const locked = shortInteger(state.locked_cap, pool.underlying.decimals);
  const poolPosition = math64toDecimal(state.pool_position);
  const tvl = unlocked + poolPosition;

  const isDefispringPool =
    pool.baseToken.id !== TokenKey.BTC && pool.quoteToken.id !== TokenKey.BTC;
  const finalApy = !isDefispringPool
    ? apy.launch_annualized
    : defispringApy === undefined
    ? undefined
    : defispringApy + apy.launch_annualized;

  return (
    <div className={styles.container}>
      <div className={styles.desc} style={{ padding: "20px" }}>
        <PairNamedBadge
          tokenA={pool.baseToken}
          tokenB={pool.quoteToken}
          size={32}
        />
        <div className={styles.poolid}>
          <TokenBadge token={pool.underlying} size={15} />{" "}
          {pool.typeAsText.toUpperCase()} POOL
        </div>
        <div className={styles.asset}>
          <span>ASSET</span>
          <span>{pool.underlying.symbol}</span>
        </div>
      </div>
      <div className={styles.content} style={{ padding: "20px" }}>
        <div className={`${styles.big} ${styles.apart}`}>
          <span className="greytext">APY</span>{" "}
          {finalApy === undefined ? (
            <span>--</span>
          ) : isDefispringPool ? (
            <DefiSpringTooltip
              title={
                <DefiSpringStakingMessage
                  apy={apy.launch_annualized}
                  defispringApy={defispringApy!}
                />
              }
            >
              <span className={finalApy > 0 ? "greentext" : "redtext"}>
                {finalApy.toFixed(2)}%
              </span>
            </DefiSpringTooltip>
          ) : (
            <span className={finalApy > 0 ? "greentext" : "redtext"}>
              {finalApy.toFixed(2)}%
            </span>
          )}
        </div>
        <BoxTwoValues
          title="TVL"
          topValue={tvl.toFixed(2) + " " + pool.underlying.symbol}
          bottomValue={
            price === undefined ? "--" : `$${(price * tvl).toFixed(2)}`
          }
        />
        <div className="divider" style={{ margin: "5px 0" }}></div>
        <BoxTwoValues
          title="UNLOCKED"
          topValue={formatNumber(unlocked) + " " + pool.underlying.symbol}
          bottomValue={
            price === undefined ? "--" : `$${formatNumber(price * unlocked, 2)}`
          }
          conf={{ size: "small" }}
        />
        <BoxTwoValues
          title="LOCKED"
          topValue={formatNumber(locked) + " " + pool.underlying.symbol}
          bottomValue={
            price === undefined ? "--" : `$${formatNumber(price * locked, 2)}`
          }
          conf={{ size: "small" }}
        />
      </div>
      <div className={styles.button}>
        <button onClick={handleClick} className="primary active">
          View Details
        </button>
      </div>
    </div>
  );
};
