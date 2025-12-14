import { Token } from "@carmine-options/sdk/core";
import { H4, P3 } from "../common/Typography";
import { carmineTokenToIcon } from "../../classes/Token";

type Badge = {
  token: Token;
  size?: "small";
  className?: string;
  color?: "black" | "white";
};

type PairBadgeType = {
  tokenA: Token;
  tokenB: Token;
  size?: "small";
  color?: "black" | "white";
};

export const TokenBadge = ({
  token,
  size,
  className,
  color: colorMaybe,
}: Badge) => {
  const Icon = carmineTokenToIcon(token.symbol);

  const color = colorMaybe || "white";

  const pxs = size === "small" ? "21px" : "28px";

  const cls = `rounded-full ${
    color === "white"
      ? "bg-dark text-dark-primary border-dark-primary"
      : "bg-brand text-dark border-dark"
  } border-[1px] ${className}`;

  return (
    <div className={cls}>
      <Icon
        className={color === "white" ? "fill-dark-primary" : "fill-dark"}
        width={pxs}
        height={pxs}
      />
    </div>
  );
};

export const TokenNamedBadge = ({ token, size }: Badge) => {
  return (
    <div className="flex items-center gap-2">
      <TokenBadge token={token} size={size} />
      <div>
        {size === "small" && <p>{token.symbol}</p>}
        {size === undefined && <h1>{token.symbol}</h1>}
      </div>
    </div>
  );
};

export const PairBadge = ({ tokenA, tokenB, size, color }: PairBadgeType) => {
  if (size === "small") {
    return <PairBadgeSmall tokenA={tokenA} tokenB={tokenB} color={color} />;
  }
  return <PairBadgeRegular tokenA={tokenA} tokenB={tokenB} color={color} />;
};

export const PairBadgeRegular = ({ tokenA, tokenB, color }: PairBadgeType) => {
  return (
    <div className="relative inline-block h-[28px] w-[55px]">
      <TokenBadge
        className="absolute top-0 left-0"
        token={tokenA}
        color={color}
      />
      <TokenBadge
        className="absolute top-0 right-0 z-10"
        token={tokenB}
        color={color}
      />
    </div>
  );
};

export const PairBadgeSmall = ({ tokenA, tokenB, color }: PairBadgeType) => {
  return (
    <div className="relative inline-block h-[21px] w-[42px]">
      <TokenBadge
        className="absolute top-0 left-0"
        token={tokenA}
        size="small"
        color={color}
      />
      <TokenBadge
        className="absolute top-0 right-0 z-10"
        token={tokenB}
        size="small"
        color={color}
      />
    </div>
  );
};

export const PairNamedBadge = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const inside = tokenA.symbol + "/" + tokenB.symbol;

  return (
    <div className="flex items-center gap-2">
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

export const PairNamedBadgeDark = ({ tokenA, tokenB, size }: PairBadgeType) => {
  const inside = tokenA.symbol + "/" + tokenB.symbol;

  return (
    <div className="flex items-center gap-2">
      <PairBadge tokenA={tokenA} tokenB={tokenB} size={size} color="black" />
      <div>
        {size === "small" && <P3>{inside}</P3>}
        {size === undefined && (
          <H4 className="font-semibold text-dark">{inside}</H4>
        )}
      </div>
    </div>
  );
};

export const PairNameAboveBadge = ({
  tokenA,
  tokenB,
  color: colorMaybe,
}: PairBadgeType) => {
  const inside = tokenA.symbol + "/" + tokenB.symbol;
  const size = "12px";
  const color = colorMaybe || "white";
  const TokenAIcon = carmineTokenToIcon(tokenA.symbol);
  const TokenBIcon = carmineTokenToIcon(tokenB.symbol);

  return (
    <div className="flex flex-col gap-1">
      <div>
        <P3>{inside}</P3>
      </div>
      <div className="relative w-[26px] h-[14px]">
        <div className="box-border absolute left-0 top-0 rounded-full border-dark-primary border-[1px] bg-dark">
          <TokenAIcon
            className={color === "white" ? "fill-dark-primary" : "fill-dark"}
            width={size}
            height={size}
          />
        </div>
        <div className="box-border absolute right-0 z-10 top-0 rounded-full border-dark-primary border-[1px] bg-dark">
          <TokenBIcon
            className={color === "white" ? "fill-dark-primary" : "fill-dark"}
            width={size}
            height={size}
          />
        </div>
      </div>
    </div>
  );
};
