import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CarmineApi } from "@carmine-options/sdk/api";

export const useAirdrop = (
  user: string
): UseQueryResult<string[] | null, Error> => {
  return useQuery({
    queryKey: ["airdrop"],
    queryFn: () => CarmineApi.airdrop(user),
  });
};
