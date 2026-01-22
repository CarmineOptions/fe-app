import { useQuery } from "@tanstack/react-query";
import { CarmineApi } from "@carmine-options/sdk/api";

export const useNonSettledOptions = (user: string) => {
  return useQuery({
    queryKey: ["user-non-settled-options", user],
    queryFn: () => CarmineApi.nonSettledOptions(user),
  });
};
