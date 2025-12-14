import { CarmineApi } from "carmine-sdk/api";
import { useQuery } from "@tanstack/react-query";

export const usePoolState = (lpAddress: string) => {
  return useQuery({
    queryKey: ["pool-state", lpAddress],
    queryFn: () => CarmineApi.poolState(lpAddress),
  });
};
