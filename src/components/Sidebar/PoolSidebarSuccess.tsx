import { Pool } from "../../classes/Pool";
import { PairNamedBadge, TokenBadge } from "../TokenBadge";

import styles from "./pool.module.css";
import { useCurrency } from "../../hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import { closeSidebar } from "../../redux/actions";
import { useStakes } from "../../hooks/useStakes";

type Props = {
  pool: Pool;
  amount: number;
  tx: string;
};

export const PoolSidebarSuccess = ({ pool, amount, tx }: Props) => {
  const { data: stakes } = useStakes();
  const price = useCurrency(pool.underlying.id);
  const navigate = useNavigate();

  const handlePortfolioClick = () => {
    navigate("/portfolio");
    closeSidebar();
  };

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

  const grey = "#444444";

  return (
    <div className={`${styles.sidebar} ${styles.success}`}>
      <div className={styles.successmessage}>
        <span>SUCCESSFUL!</span>
      </div>
      <div className={`${styles.desc} ${styles.success}`}>
        <PairNamedBadge
          tokenA={pool.baseToken}
          tokenB={pool.quoteToken}
          size={32}
        />
        <div className={styles.poolid}>
          <TokenBadge token={pool.underlying} size={15} />{" "}
          {pool.typeAsText.toUpperCase()} POOL
        </div>
      </div>
      <div className={styles.userpos}>
        <div>
          <span style={{ color: grey }}>DEPOSITED</span>
        </div>
        <div>
          <span>{amount.toFixed(4)}</span>
          <span>{pool.underlying.symbol}</span>
        </div>
        <div>
          <span className={styles.tiny} style={{ color: grey }}>
            {price === undefined ? "--" : `$${(amount * price).toFixed(2)}`}
          </span>
        </div>
      </div>
      <div className={styles.userpos}>
        <div>
          <span style={{ color: grey }}>MY POSITION</span>
        </div>
        <div>
          <span>
            {userPosition === undefined ? "--" : userPosition.toFixed(4)}
          </span>
          <span>{pool.underlying.symbol}</span>
        </div>
        <div>
          <span className={styles.tiny} style={{ color: grey }}>
            {userPosition === undefined || price === undefined
              ? "--"
              : `$${(userPosition * price).toFixed(2)}`}
          </span>
        </div>
      </div>
      <div>
        <button
          className={"blackandwhite active mainbutton"}
          onClick={handlePortfolioClick}
        >
          View Portfolio
        </button>
      </div>
      <div className="center">
        <a
          href={`https://starkscan.co/tx/${tx}`}
          target="_blank"
          rel="noreferrer"
          className={styles.txlink}
        >
          View Transaction ↗
        </a>
      </div>
    </div>
  );
};
