import { useState } from "react";
import { Pool } from "../../classes/Pool";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../../constants/amm";
import { OptionType } from "../../types/options";

import styles from "./pool.module.css";
import { PoolCard } from "./PoolCard";

export const PoolList = () => {
  const [showPools, setShowPools] = useState<"all" | "call" | "put">("all");

  const pools = [
    new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Call),
    new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Put),
    new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Call),
    new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Put),
    new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Call),
    new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Put),
    new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Call),
    new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Put),
  ];

  const selectedPools =
    showPools === "all"
      ? pools
      : showPools === "call"
      ? pools.filter((p) => p.isCall)
      : pools.filter((p) => p.isPut);

  return (
    <div className={styles.listcontainer}>
      <div className={styles.buttonscontainer + " topmargin botmargin"}>
        <div className={styles.buttons}>
          <button
            onClick={() => setShowPools("all")}
            className={showPools === "all" ? "primary active" : ""}
          >
            ALL POOLS
          </button>
          <button
            onClick={() => setShowPools("call")}
            className={showPools === "call" ? "primary active" : ""}
          >
            CALL POOLS
          </button>
          <button
            onClick={() => setShowPools("put")}
            className={showPools === "put" ? "primary active" : ""}
          >
            PUT POOLS
          </button>
        </div>
        <div className="divider" />
      </div>
      <div className={styles.poollist}>
        {selectedPools.map((p, i) => (
          <PoolCard pool={p} key={i} />
        ))}
      </div>
    </div>
  );
};
