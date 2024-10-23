import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { Pool } from "../classes/Pool";
import { apiUrl } from "../api";
import { ApiResponse, PoolData } from "../types/api";

export const fetchStakeCapital = async (
  poolId: string
): Promise<ApiResponse<PoolData>> => {
  const url = apiUrl(`${poolId}/state`);
  const res = await fetch(url);
  const body = await res.json();
  return body;
};

export const usePoolState = (pool: Pool) => {
  const { data: response, ...rest } = useQuery({
    queryKey: [QueryKeys.poolData, pool.apiPoolId],
    queryFn: async () => fetchStakeCapital(pool.apiPoolId),
  });

  if (response === undefined || response.status !== "success") {
    return {
      poolState: undefined,
      ...rest,
    };
  }

  const poolState = response.data;

  return {
    poolState,
    ...rest,
  };
};
