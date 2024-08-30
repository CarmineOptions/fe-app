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

  return (
    <div className={styles.poollist}>
      {pools.map((p, i) => (
        <PoolCard pool={p} key={i} />
      ))}
    </div>
  );
};
