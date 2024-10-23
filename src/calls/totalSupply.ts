import { Contract } from "starknet";
import ABI from "../abi/lptoken_abi.json";
import { provider } from "../network/provider";

export const getTotalSupply = async (tokenAddress: string): Promise<bigint> => {
  const contract = new Contract(ABI, tokenAddress, provider);
  const supply = await contract.totalSupply();
  return supply;
};
