import { useQuery } from "@tanstack/react-query";
import { Option, Cubit } from "carmine-sdk/core";

export const usePremia = (option: Option, size: number, isClosing: boolean) =>
  useQuery<Cubit, Error>({
    queryKey: [option.optionId, size],
    queryFn: async () => (await option.getPremia(size, isClosing)).withFees,
    enabled: true,
  });
