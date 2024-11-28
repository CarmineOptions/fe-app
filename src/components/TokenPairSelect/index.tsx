import { Dispatch, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { PairNamedBadge, TokenNamedBadge } from "../TokenBadge";

import CaretDown from "./CaretDown.svg?react";
import { allSupportedTokens, Token } from "../../classes/Token";

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

type TokenSelectProps = {
  token: Token;
  setToken: (t: Token) => void;
  tokens?: Token[];
};

export const TokenSelect = ({ token, setToken, tokens }: TokenSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (t: Token) => {
    setToken(t);
    setIsOpen(false);
  };

  const list = tokens || allSupportedTokens;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="py-6 px-5 text-left bg-light-secondary shadow-md focus:outline-none focus:ring-2 sm:text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <TokenNamedBadge token={token} size="small" />
          <CaretDown />
        </div>
      </button>
      {isOpen && (
        <ul className="z-20 absolute mt-1 w-full rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {list.map((t, i) => (
            <li
              key={i}
              className="bg-dark-container cursor-pointer py-1"
              onClick={() => handleClick(t)}
            >
              <TokenNamedBadge token={t} size="small" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
