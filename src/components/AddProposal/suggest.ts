import { fetchTokenPrices } from "../../api";
import { Pool } from "../../classes/Pool";
import { TokenPriceData } from "../../types/api";
import { ProposalOption } from "./AddProposal";
import { pools } from "./pools";
import { Option } from "@carmine-options/sdk/core";

export const isDuplicate = (
  options: Option[],
  maturity: number,
  strike: number,
  poolId: string
): boolean => {
  const filtered = options.filter((o) => {
    return (
      o.poolId === poolId &&
      o.strikePrice.val === strike &&
      o.maturity === maturity
    );
  });

  return filtered.length > 0;
};

export const handleDuplicates = (
  propOptions: ProposalOption[],
  liveOptions: Option[]
): ProposalOption[] => {
  return propOptions.map((o) => {
    if (isDuplicate(liveOptions, o.maturity, o.strike, o.pool)) {
      return { ...o, active: false };
    }
    return { ...o, active: true };
  });
};

const generateProposalOptions = (
  pool: Pool,
  maturity: number,
  prices: TokenPriceData,
  live: Option[]
): ProposalOption[] => {
  const basePrice = prices[pool.baseToken.id];
  const quotePrice = prices[pool.quoteToken.id];
  const [rounding, step] = pool.strikeStep;

  const cleanBaseTen = (n: number) => parseFloat(n.toFixed(3));

  const rootStrike = Math.round(basePrice / quotePrice / rounding) * rounding;

  const strikes = pool.isCall
    ? [rootStrike - step, rootStrike, rootStrike + step, rootStrike + 2 * step]
    : [rootStrike + step, rootStrike, rootStrike - step, rootStrike - 2 * step];

  const propOptions = strikes.map((strike) => {
    const cleanStrike = cleanBaseTen(strike);

    return {
      maturity,
      volatility: pool.baseVolatility,
      pool: pool.poolId,
      strike: cleanStrike,
    };
  });

  return handleDuplicates(propOptions, live);
};

export const suggestOptions = async (
  live: Option[],
  maturity: number
): Promise<ProposalOption[]> => {
  const tokenPrices = await fetchTokenPrices();

  return pools.flatMap((pool) =>
    generateProposalOptions(pool, maturity, tokenPrices, live)
  );
};
