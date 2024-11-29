import { Dispatch, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { PairBadge, PairNamedBadge, TokenNamedBadge } from "../TokenBadge";

import CaretDown from "./CaretDown.svg?react";
import { allSupportedTokens, Token } from "../../classes/Token";
import { Pool } from "../../classes/Pool";
import { pools } from "../AddProposal/pools";
import { P3 } from "../common";

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
          {options
            .filter((v) => v.pairId !== pair.pairId)
            .map((p, i) => (
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
          {list
            .filter((v) => v.id !== token.id)
            .map((t, i) => (
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

type PoolSelectProps = {
  pool: Pool;
  setPool: (poolId: string) => void;
};

export const PoolSelect = ({ pool, setPool }: PoolSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (p: Pool) => {
    setPool(p.poolId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="py-2 text-left bg-dark rounded-lg shadow-md focus:outline-none focus:ring-2 sm:text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-2">
          <PairBadge tokenA={pool.baseToken} tokenB={pool.quoteToken} />
          <P3 className="font-semibold">{pool.typeAsText}</P3>
          <CaretDown />
        </div>
      </button>
      {isOpen && (
        <ul className="absolute z-50 bg-dark mt-1 w-full rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {pools
            .filter((v) => v.poolId !== pool.poolId)
            .map((p, i) => (
              <li
                key={i}
                className="bg-dark-container cursor-pointer py-1"
                onClick={() => handleClick(p)}
              >
                <div className="flex items-center gap-2">
                  <PairBadge tokenA={p.baseToken} tokenB={p.quoteToken} />
                  <P3 className="font-semibold">{p.typeAsText}</P3>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

type MaturitySelectProps = {
  maturity: number;
  maturities: number[];
  setMaturity: (n: number) => void;
};

export const MaturitySelect = ({
  maturity,
  maturities,
  setMaturity,
}: MaturitySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const tsToDate = (timestamp: number): string => {
    const dateObj = new Date(timestamp * 1000);

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const dateString = dateObj.toLocaleDateString("en-US", dateOptions);

    return dateString;
  };

  const handleClick = (m: number) => {
    setMaturity(m);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="py-2 text-left bg-dark rounded-lg shadow-md focus:outline-none focus:ring-2 sm:text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between gap-2">
          <P3 className="font-semibold">{tsToDate(maturity)}</P3>
          <CaretDown />
        </div>
      </button>
      {isOpen && (
        <ul className="absolute z-50 bg-dark mt-1 w-full rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {maturities
            .filter((v) => v !== maturity)
            .map((m, i) => (
              <li
                key={i}
                className="bg-dark-container cursor-pointer py-1"
                onClick={() => handleClick(m)}
              >
                <div className="flex items-center justify-between gap-2">
                  <P3 className="font-semibold">{tsToDate(m)}</P3>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};
