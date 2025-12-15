import { useQuery } from "@tanstack/react-query";

import {
  allLiquidityPools,
  CarmineAmm,
  OptionWithPremia,
} from "@carmine-options/sdk/core";

export const useOptions = (lpAddress: string) => {
  const { data, ...rest } = useQuery({
    queryKey: ["live-options-with-premia", lpAddress],
    queryFn: async () =>
      CarmineAmm.getAllNonExpiredOptionsWithPremia(lpAddress),
  });

  return {
    ...rest,
    options: data as OptionWithPremia[] | undefined,
  };
};

export const useOptionsAllPools = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["live-options-with-premia", "all-pools"],
    queryFn: async () => {
      const optionsPerPool = await Promise.all(
        allLiquidityPools.map((pool) =>
          CarmineAmm.getAllNonExpiredOptionsWithPremia(pool.lpAddress)
        )
      );

      return optionsPerPool.flat();
    },
  });

  return {
    ...rest,
    options: data as OptionWithPremia[] | undefined,
  };
};
