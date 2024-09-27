import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Pool } from "../../classes/Pool";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../../constants/amm";
import { OptionType } from "../../types/options";
import { PoolItem } from "./PoolItem";

import styles from "./pooltable.module.css";

export const PoolTable = () => {
  const isWideScreen = !useIsMobile();
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
    <div className={styles.outer} style={{ marginTop: "20px" }}>
      <div className={styles.inner + " " + styles.mobilewidth}>
        <div className={"tableheader " + styles.itemmobilesize}>
          <div>pool</div>
          <div>type</div>
          <div>{isWideScreen ? "apy all time" : "apy"}</div>
          {isWideScreen && <div>apy last week</div>}
          {isWideScreen && <div>tvl</div>}
          <div>my deposit</div>
          <div></div>
        </div>
        <div className={styles.container}>
          {pools.map((pool) => (
            <PoolItem pool={pool} />
          ))}
        </div>
      </div>
    </div>
  );
};
