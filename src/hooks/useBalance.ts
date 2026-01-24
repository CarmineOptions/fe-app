import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { balanceOf } from "../calls/balanceOf";

export const useBalance = (tokenAddress: string) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["balance", tokenAddress],
    queryFn: () => balanceOf(address!, tokenAddress),
    enabled: !!address,
  });
};
