import { QueryFunctionContext } from "@tanstack/react-query";
import { apiUrl } from "../../api";
import { ApiResponse, APYData, PoolData } from "../../types/api";

export const fetchStakeCapital = async ({
  queryKey,
}: QueryFunctionContext<[string, any]>): Promise<any | undefined> => {
  const pool = queryKey[1];
  const url = apiUrl(`${pool.apiPoolId}/state`);
  const res = await fetch(url);
  const body = await res.json();
  return body;
};

export const queryPoolCapital = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<{
  state: PoolData;
  apy: APYData;
}> => {
  const pool = queryKey[1];
  const stateUrl = apiUrl(`${pool}/state`);
  const apyUrl = apiUrl(`${pool}/apy`, { version: 2 });
  const [stateRes, apyRes] = await Promise.all([
    fetch(stateUrl),
    fetch(apyUrl),
  ]);
  const stateData = (await stateRes.json()) as ApiResponse<PoolData>;
  const apyData = (await apyRes.json()) as ApiResponse<APYData>;

  if (stateData.status === "success" && apyData.status === "success") {
    return { state: stateData.data, apy: apyData.data };
  }

  throw Error(`Failed fetching ${pool} data`);
};
