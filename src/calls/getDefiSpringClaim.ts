import { provider } from "../network/provider";
import { debug } from "../utils/debugger";
import { AccountInterface, Contract } from "starknet";

import ABI from "../abi/defi_spring_abi.json";
import { QueryFunctionContext } from "@tanstack/react-query";

const defiSpringContractAddress =
  "0x07838fe8cdd61eb445f7773d9648476b571f17242058859ed7fba9074ee915d1";

export const getDefiSpringClaimedQuery = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<bigint> => {
  const address = queryKey[1];
  return getDefiSpringClaimed(address);
};

export const getDefiSpringClaimed = async (
  address: string
): Promise<bigint> => {
  const contract = new Contract(ABI, defiSpringContractAddress, provider);
  const res = await contract
    .call("amount_already_claimed", [address])
    .catch((e: Error) => {
      debug("Failed getting defi spring claimed", e.message);
      throw Error(e.message);
    });

  return res as bigint;
};

export const defiSpringClaim = async (
  account: AccountInterface,
  calldata: (string | number)[]
) => {
  const call = {
    entrypoint: "claim",
    calldata,
    contractAddress: defiSpringContractAddress,
  };
  const res = await account.execute(call, [ABI]).catch((e) => {
    debug("Trade open rejected or failed", e.message);
    throw Error("Trade open rejected or failed");
  });

  return res;
};
