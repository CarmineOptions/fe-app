import Starknet from "./starknet-tiny.svg?react";

import styles from "./badges.module.css";

export const DefispringBadge = () => (
  <div className={styles.badge + " " + styles.defispring}>
    <span style={{ color: "#0D0E0F", lineHeight: 1 }} className="l2 bold">
      <Starknet /> DEFI SPRING
    </span>
  </div>
);
