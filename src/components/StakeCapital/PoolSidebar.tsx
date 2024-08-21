import { useState } from "react";
import { Pool } from "../../classes/Pool";
import { PairNamedBadge, TokenBadge, TokenNamedBadge } from "../TokenBadge";

import styles from "./pool.module.css";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useQuery } from "react-query";
import { queryPoolCapital } from "./fetchStakeCapital";
import { useCurrency } from "../../hooks/useCurrency";

type Props = {
  pool: Pool;
};

export const PoolSidebar = ({ pool }: Props) => {
  const { data } = useQuery(
    [`pool-data-${pool.apiPoolId}`, pool.apiPoolId],
    queryPoolCapital
  );
  const price = useCurrency(pool.underlying.id);

  const [action, setAction] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<number>(0);
  const [amountText, setAmountText] = useState<string>("");

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  const state = data?.state;
  const apy = data?.apy;

  return (
    <div className={styles.sidebar}>
      <div className={styles.desc}>
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
      <div className={styles.action}>
        <div className={styles.actionbuttons}>
          <button
            onClick={() => setAction("deposit")}
            className={action === "deposit" ? styles.active : ""}
          >
            deposit
          </button>
          <button
            onClick={() => setAction("withdraw")}
            className={action === "withdraw" ? styles.active : ""}
          >
            withdraw
          </button>
        </div>
        <div>
          <div className={styles.tokeninput}>
            <div className={styles.under}>
              <input onChange={handleChange} type="text" value={amountText} />
              <span className={styles.tiny} style={{ alignSelf: "flex-start" }}>
                ${price === undefined ? "--" : (price * amount).toFixed(2)}
              </span>
            </div>
            <div>
              <TokenNamedBadge token={pool.underlying} size={23} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
