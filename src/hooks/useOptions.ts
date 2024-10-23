import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { fetchOptions } from "../components/TradeTable/fetchOptions";
import { OptionWithPremia } from "../classes/Option";

export const useOptions = () => {
  const { data, ...rest } = useQuery({
    queryKey: [QueryKeys.options],
    queryFn: fetchOptions,
  });

  return {
    ...rest,
    options: data as OptionWithPremia[] | undefined,
  };
};
