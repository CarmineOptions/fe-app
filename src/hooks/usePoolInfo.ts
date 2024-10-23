import { useQuery } from "@tanstack/react-query";
import { queryPoolCapital } from "../components/Yield/fetchStakeCapital";
import { QueryKeys } from "../queries/keys";

export const usePoolInfo = (id: string) => {
  const { data: poolInfo, ...rest } = useQuery({
    queryKey: [QueryKeys.poolData, id],
    queryFn: () => queryPoolCapital(id),
  });

  return { poolInfo, ...rest };
};
