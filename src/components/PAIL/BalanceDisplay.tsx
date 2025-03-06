import { Pair } from "../../classes/Pair";

type Props = {
  pair: Pair;
  base: number | undefined;
  quote: number | undefined;
};

export const BalanceDisplay = ({ pair, base, quote }: Props) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span>Balance {pair.baseToken.symbol}</span>
        <span className="text-dark-secondary">
          {base ? base.toFixed(2) : "--"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span>Balance {pair.quoteToken.symbol}</span>
        <span className="text-dark-secondary">
          {quote ? quote.toFixed(2) : "--"}
        </span>
      </div>
    </div>
  );
};
