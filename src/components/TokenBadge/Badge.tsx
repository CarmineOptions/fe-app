import { Token } from "../../classes/Token";
import { H4, P3 } from "../common/Typography";

type Badge = {
  token: Token;
  size?: "small";
  className?: string;
};

type PairBadgeType = {
  tokenA: Token;
  tokenB: Token;
  size?: "small";
};

export const TokenBadge = ({ token, size, className }: Badge) => {
  const { icon: Icon } = token;

  const pxs = size === "small" ? "21px" : "28px";

  const cls = `rounded-full border-dark-primary border-[1px] bg-dark ${className}`;

  return (
    <div className={cls}>
      <Icon width={pxs} height={pxs} />
    </div>
  );
};

export const TokenNamedBadge = ({ token, size }: Badge) => {
  return (
    <div className="flex items-center gap-[4px]">
      <TokenBadge token={token} size={size} />
      <div>
        {size === "small" && <p>{token.symbol}</p>}
        {size === undefined && <h1>{token.symbol}</h1>}
      </div>
    </div>
  );
};

export const PairBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  if (size === "small") {
    return <PairBadgeSmall tokenA={tokenA} tokenB={tokenB} />;
  }
  return <PairBadgeRegular tokenA={tokenA} tokenB={tokenB} />;
};

export const PairBadgeRegular = ({ tokenA, tokenB }: PairBadgeType) => {
  return (
    <div className="relative inline-block h-[28px] w-[55px]">
      <TokenBadge className="absolute top-0 left-0" token={tokenA} />
      <TokenBadge className="absolute top-0 right-0 z-10" token={tokenB} />
    </div>
  );
};

export const PairBadgeSmall = ({ tokenA, tokenB }: PairBadgeType) => {
  return (
    <div className="relative inline-block h-[21px] w-[42px]">
      <TokenBadge
        className="absolute top-0 left-0"
        token={tokenA}
        size="small"
      />
      <TokenBadge
        className="abosulute top-0 right-0 z-10"
        token={tokenB}
        size="small"
      />
    </div>
  );
};

export const PairNamedBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const inside = tokenA.symbol + "/" + tokenB.symbol;

  return (
    <div className="flex items-center gap-[4px]">
      <PairBadge tokenA={tokenA} tokenB={tokenB} size={size} />
      <div>
        {size === "small" && <P3>{inside}</P3>}
        {size === undefined && (
          <H4 className="font-semibold text-dark-primary">{inside}</H4>
        )}
      </div>
    </div>
  );
};
