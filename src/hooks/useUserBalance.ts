import { balanceOf } from "./../calls/balanceOf";
import { useAccount } from "./useAccount";
import { QueryFunctionContext, useQuery } from "react-query";

export const queryUserBalance = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined, string]>): Promise<
  bigint | undefined
> => {
  const userAddress = queryKey[1];
  const tokenAddress = queryKey[2];

  if (!userAddress) {
    return undefined;
  }

  return balanceOf(userAddress, tokenAddress);
};

export const useUserBalance = (tokenAddress: string): bigint | undefined => {
  const account = useAccount();

  const { data } = useQuery(
    [`${account?.address}-${tokenAddress}`, account?.address, tokenAddress],
    queryUserBalance
  );

  return data;
};
