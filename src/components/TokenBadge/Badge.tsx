import { Token } from "../../classes/Token";

import styles from "./badge.module.css";

type Badge = {
  token: Token;
  size?: "small";
};

type PairBadgeType = {
  tokenA: Token;
  tokenB: Token;
  size?: "small";
};

export const TokenBadge = ({ token, size }: Badge) => {
  const { icon } = token;

  const className =
    size === undefined
      ? styles.container
      : styles.container + " " + styles[size];

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${icon})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

export const TokenNamedBadge = ({ token, size }: Badge) => {
  const className =
    size === undefined ? styles.named : styles.named + " " + styles[size];

  return (
    <div className={className}>
      <TokenBadge token={token} size={size} />
      <div className={styles.text}>{token.symbol}</div>
    </div>
  );
};

export const PairBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const className =
    size === undefined ? styles.pair : styles.pair + " " + styles[size];

  return (
    <div className={className}>
      <TokenBadge token={tokenA} size={size} />
      <TokenBadge token={tokenB} size={size} />
    </div>
  );
};

export const PairNamedBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const className =
    size === undefined ? styles.named : styles.named + " " + styles[size];

  return (
    <div className={className}>
      <PairBadge tokenA={tokenA} tokenB={tokenB} size={size} />
      <div className={styles.text}>
        {tokenA.symbol}/{tokenB.symbol}
      </div>
    </div>
  );
};
