import { Pool } from "../classes/Pool";
import { usePoolApy } from "./usePoolApy";
import { usePoolState } from "./usePoolState";

export const usePoolInfo = (pool: Pool) => {
  const {
    apy,
    isLoading: isApyLoading,
    isError: isApyError,
  } = usePoolApy(pool);
  const {
    poolState,
    isLoading: isPoolStateLoading,
    isError: isPoolStateError,
  } = usePoolState(pool);

  if (isApyError || isPoolStateError) {
    return {
      poolInfo: undefined,
      isError: true,
      isLoading: false,
    };
  }

  if (isApyLoading || isPoolStateLoading) {
    return {
      poolInfo: undefined,
      isError: false,
      isLoading: true,
    };
  }

  if (apy && poolState) {
    return {
      poolInfo: { state: poolState, apy },
      isLoading: false,
      isError: false,
    };
  }

  throw Error("Pool state - unreachable");
};
