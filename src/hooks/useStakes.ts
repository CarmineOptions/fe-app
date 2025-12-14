import { CarmineAmm } from "@carmine-options/sdk/core";
import { useQuery } from "@tanstack/react-query";
import { getUserPoolInfo } from "../calls/getUserPoolInfo";
import { UserPoolInfo } from "../classes/Pool";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";

export const fetchCapital = async (
  address: string
): Promise<UserPoolInfo[]> => {
  const userPools = await getUserPoolInfo(address);

  const withValue = userPools.filter((pool) => pool.size > 0 && pool.value > 0);

  return withValue;
};

export const useStakes = () => {
  const { address } = useAccount();

  const { data: stakes, ...rest } = useQuery({
    queryKey: [QueryKeys.stake, address],
    queryFn: async () => fetchCapital(address!),
    enabled: !!address,
  });

  return {
    stakes,
    ...rest,
  };
};

export const useUserPoolStakes = (lpAddress: string) => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-pool-stakes", address, lpAddress],
    queryFn: () => CarmineAmm.getUserPoolInfo(address!, lpAddress),
    enabled: !!address,
  });
};
