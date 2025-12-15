import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { CarmineAmm } from "@carmine-options/sdk/core";

export const usePositions = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["user-positions", address],
    queryFn: () => CarmineAmm.getOptionsWithPositionOfUser(address!),
    enabled: !!address,
  });
};
