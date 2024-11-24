import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { getTotalSupply } from "../calls/totalSupply";

export const useTotalSupply = (address: string) => {
  return useQuery({
    queryKey: [QueryKeys.totalSupply, address],
    queryFn: () => getTotalSupply(address),
  });
};
