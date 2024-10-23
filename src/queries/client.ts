import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import { QueryKeys } from "./keys";

// 5 minutes
const staleTime = 5 * 60 * 1000;

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

export const invalidatePositions = () =>
  queryClient.invalidateQueries({ queryKey: [QueryKeys.position] });
export const invalidateStake = () =>
  queryClient.invalidateQueries({ queryKey: [QueryKeys.stake] });
export const invalidateKey = (queryKey: QueryKeys | string) =>
  queryClient.invalidateQueries({ queryKey: [queryKey] });
