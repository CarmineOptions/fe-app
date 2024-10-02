import { Contract } from "starknet";
import ABI from "../abi/lptoken_abi.json";
import { provider } from "../network/provider";
import { QueryFunctionContext } from "react-query";

export const getTotalSupply = async (tokenAddress: string): Promise<bigint> => {
  const contract = new Contract(ABI, tokenAddress, provider);
  const supply = await contract.totalSupply();
  return supply;
};

export const queryTotalSupply = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<bigint> => {
  const address = queryKey[1];

  const supply = await getTotalSupply(address);

  return supply;
};
