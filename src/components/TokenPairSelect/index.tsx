import { Dispatch, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { PairNamedBadge } from "../TokenBadge";

import CaretDown from "./CaretDown.svg?react";

type TokenPairSelectProps = {
  pair: Pair;
  setPair: Dispatch<React.SetStateAction<Pair>>;
};

export const TokenPairSelect = ({ pair, setPair }: TokenPairSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (p: Pair) => {
    setPair(p);
    setIsOpen(false);
  };

  const options = [
    PairKey.STRK_USDC,
    PairKey.ETH_USDC,
    PairKey.ETH_STRK,
    PairKey.BTC_USDC,
    PairKey.EKUBO_USDC,
  ].map((key) => Pair.pairByKey(key));

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="py-2 pr-10 text-left bg-dark rounded-lg shadow-md focus:outline-none focus:ring-2 sm:text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <PairNamedBadge tokenA={pair.baseToken} tokenB={pair.quoteToken} />
          <CaretDown />
        </div>
      </button>
      {isOpen && (
        <ul className="absolute mt-1 w-full rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map((p, i) => (
            <li
              key={i}
              className="bg-dark-container cursor-pointer py-1"
              onClick={() => handleClick(p)}
            >
              <PairNamedBadge tokenA={p.baseToken} tokenB={p.quoteToken} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
