import { useQuery } from "@tanstack/react-query";
import { CarmineApi } from "@carmine-options/sdk/api";

export const useTradeEvents = (user: string, limit: number, offset: number) => {
  return useQuery({
    queryKey: ["trade-events", user, limit, offset],
    queryFn: () => CarmineApi.tradeEvents(user, { limit, offset }),
  });
};

export const useLiquidityEvents = (
  user: string,
  limit: number,
  offset: number
) => {
  return useQuery({
    queryKey: ["liquidity-events", user, limit, offset],
    queryFn: () => CarmineApi.liquidityEvents(user, { limit, offset }),
  });
};

export const useVoteEvents = (user: string, limit: number, offset: number) => {
  return useQuery({
    queryKey: ["vote-events", user, limit, offset],
    queryFn: () => CarmineApi.voteEvents(user, { limit, offset }),
  });
};
