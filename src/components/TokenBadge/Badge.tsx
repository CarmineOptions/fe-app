import { Token } from "../../classes/Token";

import styles from "./badge.module.css";

export const TokenBadge = ({ token }: { token: Token }) => {
  const { icon } = token;

  return (
    <div className={styles.container}>
      <img src={icon} alt={`${token.id} token icon`} />
    </div>
  );
};

export const TokenNamedBadge = ({ token }: { token: Token }) => {
  return (
    <div className={styles.named}>
      <TokenBadge token={token} />
      <span>{token.symbol}</span>
    </div>
  );
};

export const TokenNamedBadgeSmall = ({ token }: { token: Token }) => {
  const { icon } = token;

  return (
    <div className={styles.namedsmall}>
      <div className={styles.containersmall}>
        <img src={icon} alt={`${token.id} token icon`} />
      </div>
      <span>{token.symbol}</span>
    </div>
  );
};

export const PairBadge = ({
  tokenA,
  tokenB,
}: {
  tokenA: Token;
  tokenB: Token;
}) => {
  return (
    <div className={styles.pair}>
      <TokenBadge token={tokenA} />
      <TokenBadge token={tokenB} />
    </div>
  );
};

export const PairNamedBadge = ({
  tokenA,
  tokenB,
}: {
  tokenA: Token;
  tokenB: Token;
}) => {
  return (
    <div className={styles.named}>
      <PairBadge tokenA={tokenA} tokenB={tokenB} />
      <span>
        {tokenA.symbol}/{tokenB.symbol}
      </span>
    </div>
  );
};
