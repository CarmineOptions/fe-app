import { useQuery } from "@tanstack/react-query";
import { TokenKey } from "../classes/Token";
import { apiUrl } from "../api";
import { ApiResponse, TokenPriceData } from "../types/api";
import { QueryKeys } from "../queries/keys";

const tokenPriceQuery = async () => {
  const url = apiUrl("token-prices");
  const res = await fetch(url);
  const body = (await res.json()) as ApiResponse<TokenPriceData>;
  if (body.status === "success") {
    return body.data;
  }
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
