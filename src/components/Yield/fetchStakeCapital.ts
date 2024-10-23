import { apiUrl } from "../../api";
import { ApiResponse, APYData, PoolData } from "../../types/api";
import { UserPoolInfo } from "../../classes/Pool";
import { getUserPoolInfo } from "../../calls/getUserPoolInfo";

export const fetchStakeCapital = async (
  poolId: string
): Promise<any | undefined> => {
  const url = apiUrl(`${poolId}/state`);
  const res = await fetch(url);
  const body = await res.json();
  return body;
};

export const queryPoolCapital = async (
  pool: string
): Promise<{
  state: PoolData;
  apy: APYData;
}> => {
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

export const queryUserPoolInfo = async (
  address: string | undefined
): Promise<UserPoolInfo[] | undefined> => {
  if (address === undefined) {
    return;
  }
  const userPools = await getUserPoolInfo(address);
  const withValue = userPools.filter((pool) => pool.size > 0 && pool.value > 0);
  return withValue;
};
