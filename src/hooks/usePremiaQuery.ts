import { useQuery } from "@tanstack/react-query";
import { getPremia } from "../calls/getPremia";
import { Option } from "../classes/Option";
import { QueryKeys } from "../queries/keys";

export const usePremiaQuery = (
  option: Option,
  size: number,
  isClosing: boolean
) =>
  useQuery<bigint, Error>({
    queryKey: [QueryKeys.premia, option.optionId, size, isClosing],
    queryFn: () => getPremia(option, size, isClosing),
    enabled: true,
  });
