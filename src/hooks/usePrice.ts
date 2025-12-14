import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CarmineApi, LivePrices } from "carmine-sdk/api";

export const usePrices = (): UseQueryResult<LivePrices, Error> => {
  return useQuery({
    queryKey: ["live-prices"],
    queryFn: CarmineApi.livePrices,
  });
};

export const useTokenPrice = (symbol: string): number | undefined => {
  const { data } = usePrices();

  if (symbol === "USDC") {
    // assuming USDC never depegs
    return 1;
  }

  if (!data) {
    return undefined;
  }

  if (data[symbol as keyof LivePrices] !== undefined) {
    return data[symbol as keyof LivePrices] as number;
  }

  throw Error(`Failed getting price for ${symbol}`);
};
