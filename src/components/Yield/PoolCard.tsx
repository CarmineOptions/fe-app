import { useQuery } from "react-query";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";
import { queryPoolCapital } from "./fetchStakeCapital";
import { Pool } from "../../classes/Pool";

import styles from "./pool.module.css";
import { shortInteger } from "../../utils/computations";
import { useCurrency } from "../../hooks/useCurrency";
import { math64toDecimal } from "../../utils/units";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { PoolSidebar } from "./PoolSidebar";
import { LoadingAnimation } from "../Loading/Loading";

type Props = {
  pool: Pool;
};

export const PoolCard = ({ pool }: Props) => {
  const { isLoading, isError, data } = useQuery(
    [`pool-data-${pool.apiPoolId}`, pool.apiPoolId],
    queryPoolCapital
  );
  const price = useCurrency(pool.underlying.id);

  const handleClick = () => {
    setSidebarContent(<PoolSidebar pool={pool} />);
    openSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <span className={apy.launch_annualized > 0 ? "greentext" : "redtext"}>
            {apy.launch_annualized.toFixed(2)}%
          </span>
        </div>
        <div className={styles.under}>
          <div className={`${styles.big} ${styles.apart}`}>
            <span className="greytext">TVL</span>{" "}
            <span>
              {tvl.toFixed(2)} {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined ? "---" : `$${(price * tvl).toFixed(2)}`}
          </span>
        </div>
        <div className="divider" style={{ margin: "5px 0" }}></div>
        <div className={styles.under}>
          <div className={`${styles.small} ${styles.apart}`}>
            <span className="greytext">UNLOCKED</span>{" "}
            <span>
              {unlocked.toFixed(2)} {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined ? "---" : `$${(price * unlocked).toFixed(2)}`}
          </span>
        </div>
        <div className={styles.under}>
          <div className={`${styles.small} ${styles.apart}`}>
            <span className="greytext">LOCKED</span>{" "}
            <span>
              {locked.toFixed(2)} {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined ? "---" : `$${(price * locked).toFixed(2)}`}
          </span>
        </div>
      </div>
      <div className={styles.button}>
        <button onClick={handleClick} className="primary active">
          View Details
        </button>
      </div>
    </div>
  );
};
