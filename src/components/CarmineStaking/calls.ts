import { QueryFunctionContext } from "@tanstack/react-query";
import { getStakes } from "../../calls/carmineStake";
import { balanceOf } from "../../calls/balanceOf";
import {
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
  VE_CRM_ADDRESS,
} from "../../constants/amm";
import { CarmineStake } from "../../classes/CarmineStake";
import { ec, hash, shortString } from "starknet";
import { provider } from "../../network/provider";

export const fetchStakes = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<CarmineStake[]> => {
  const address = queryKey[1];
  return getStakes(address);
};

type StakingData = {
  veCarmBalance: bigint;
  carmBalance: bigint;
  stakes: CarmineStake[];
};

export const fetchStakingData = async (
  address: string
): Promise<StakingData> => {
  const promises = [
    balanceOf(address, VE_CRM_ADDRESS),
    balanceOf(address, CRM_ADDRESS),
    getStakes(address),
  ];
  const values = await Promise.all(promises);
  const result = {
    veCarmBalance: values[0] as bigint,
    carmBalance: values[1] as bigint,
    stakes: values[2] as CarmineStake[],
  };

  return result;
};

export const readStorage = async (address: string) => {
  const selector_airdrop_claimed = hash.keccakBn(
    shortString.encodeShortString("airdrop_claimed")
  );
  const key = ec.starkCurve.pedersen(selector_airdrop_claimed, address);

  const storage_value = await provider.getStorageAt(GOVERNANCE_ADDRESS, key);
  return BigInt(storage_value);
};
