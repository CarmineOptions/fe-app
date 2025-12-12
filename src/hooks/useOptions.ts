import { useQuery } from "@tanstack/react-query";

import { CarmineAmm, OptionWithPremia } from "carmine-sdk/core";

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
