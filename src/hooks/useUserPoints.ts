import { CarmineApi, TopUsers } from "@carmine-options/sdk/api";
import { useQuery } from "@tanstack/react-query";

export const useUserPoints = (user?: string) =>
  useQuery<TopUsers, Error>({
    queryKey: ["user-points", user],
    queryFn: () => CarmineApi.userPoints(user),
  });
