import { CarmineAmm } from "@carmine-options/sdk/core";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";

export const useStakes = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-pool-stakes-all-pools", address],
    queryFn: () => CarmineAmm.getUserPoolInfoAllPools(address!),
    enabled: !!address,
  });
};

export const useUserPoolStakes = (lpAddress: string) => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-pool-stakes", address, lpAddress],
    queryFn: () => CarmineAmm.getUserPoolInfo(address!, lpAddress),
    enabled: !!address,
  });
};
