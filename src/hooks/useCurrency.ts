import { useQuery } from "@tanstack/react-query";
import { TokenKey } from "../classes/Token";
import { apiUrl } from "../api";
import { ApiResponse, TokenPriceData } from "../types/api";
import { QueryKeys } from "../queries/keys";
import { Token } from "carmine-sdk/core";

const toTokenKey = (symbol: string): TokenKey | undefined => {
  const normalized = symbol.toLowerCase();
  if (normalized === "wbtc") {
    return TokenKey.BTC;
  }
  if (normalized === TokenKey.ETH) {
    return TokenKey.ETH;
  }
  if (normalized === TokenKey.USDC) {
    return TokenKey.USDC;
  }
  if (normalized === TokenKey.STRK) {
    return TokenKey.STRK;
  }
  if (normalized === TokenKey.EKUBO) {
    return TokenKey.EKUBO;
  }

  return undefined;
};

const tokenPriceQuery = async () => {
  const url = apiUrl("token-prices");
  const res = await fetch(url);
  const body = (await res.json()) as ApiResponse<TokenPriceData>;
  if (body.status === "success") {
    return body.data;
  }
};

export const useTokenPrice = (token: Token): number | undefined => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.tokenPrices],
    queryFn: tokenPriceQuery,
  });

  if (isLoading || isError || !data) {
    return undefined;
  }

  const key = toTokenKey(token.symbol);
  if (!key) {
    return undefined;
  }

  return data[key];
};

export const useCurrency = (id: TokenKey): number | undefined => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.tokenPrices],
    queryFn: tokenPriceQuery,
  });

  if (isLoading || isError || !data) {
    return undefined;
  }

  return data[id];
};
