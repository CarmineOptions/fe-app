import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../api";
import { Pool } from "../classes/Pool";
import { APYData } from "../types/api";
import { QueryKeys } from "../queries/keys";

export const getPoolApy = async (pool: string): Promise<APYData> => {
  const apyUrl = apiUrl(`${pool}/apy`, { version: 2 });

  const res = await fetch(apyUrl).then((response) => response.json());

  if (res && res.status === "success" && res?.data) {
    return res.data;
  }

  throw Error(`Failed fetching ${pool} APY`);
};

export const usePoolApy = (pool: Pool) => {
  const { data: apy, ...rest } = useQuery({
    queryKey: [QueryKeys.apy, pool.apiPoolId],
    queryFn: async () => getPoolApy(pool.apiPoolId),
  });

  return {
    apy,
    ...rest,
  };
};
