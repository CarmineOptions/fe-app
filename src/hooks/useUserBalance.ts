import { useAccount } from "@starknet-react/core";
import { balanceOf } from "./../calls/balanceOf";
import { useQuery } from "@tanstack/react-query";

export const queryUserBalance = async (
  userAddress: string,
  tokenAddress: string
): Promise<bigint | undefined> => {
  return balanceOf(userAddress, tokenAddress);
};

export const useUserBalance = (tokenAddress: string) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["user-balance", address, tokenAddress],
    queryFn: async () => queryUserBalance(address!, tokenAddress),
    enabled: !!address,
  });
};
