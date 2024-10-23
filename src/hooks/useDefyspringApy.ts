import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { apiUrl } from "../api";

export const queryDefiSpringApy = async (): Promise<number> => {
  const res = await fetch(
    apiUrl("defispring", { version: 1, network: "mainnet" })
  ).then((response) => response.json());

  if (res && res.status === "success" && res?.data?.apy) {
    return res.data.apy * 100;
  }

  throw Error("Failed getting defispring APY");
};

export const useDefispringApy = () => {
  const { data: defispringApy, ...rest } = useQuery({
    queryKey: [QueryKeys.defispringApy],
    queryFn: queryDefiSpringApy,
  });

  return {
    defispringApy,
    ...rest,
  };
};
