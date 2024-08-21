import { Token } from "../../classes/Token";

import styles from "./badge.module.css";

type Badge = {
  token: Token;
  size?: number;
};

type PairBadgeType = {
  tokenA: Token;
  tokenB: Token;
  size?: number;
};

export const TokenBadge = ({ token, size }: Badge) => {
  const { icon } = token;

  const validSize = size === undefined ? 40 : size;

  const style = { width: `${validSize}px`, height: `${validSize}px` };

  return (
    <div className={styles.container} style={style}>
      <img src={icon} alt={`${token.id} token icon`} />
    </div>
  );
};

export const TokenNamedBadge = ({ token, size }: Badge) => {
  const validSize = size === undefined ? 40 : size;

  const fontSize = 0.8 * validSize;
  const lineHeight = 0.95 * validSize;

  return (
    <div
      className={styles.named}
      style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px` }}
    >
      <TokenBadge token={token} size={size} />
      <span>{token.symbol}</span>
    </div>
  );
};

export const PairBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const validSize = size === undefined ? 40 : size;

  const width = 1.6 * validSize;

  return (
    <div
      className={styles.pair}
      style={{ width: `${width}px`, height: `${validSize}px` }}
    >
      <TokenBadge token={tokenA} size={size} />
      <TokenBadge token={tokenB} size={size} />
    </div>
  );
};

export const PairNamedBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const validSize = size === undefined ? 40 : size;

  const fontSize = 0.8 * validSize;
  const lineHeight = 0.95 * validSize;

  return (
    <div
      className={styles.named}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
      }}
    >
      <PairBadge tokenA={tokenA} tokenB={tokenB} size={size} />
      <span>
        {tokenA.symbol}/{tokenB.symbol}
      </span>
    </div>
  );
};
