import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";

type OblData = {
  date: string;
  protocol: string;
  allocation: number;
  tvl: number;
  volumes: number;
  beta_fees: number;
  apr: number;
};

type OblResponse = { Carmine: OblData[] };

export const queryDefiSpringApy = async (): Promise<number> => {
  const res: OblResponse = await fetch(
    // OBL allocations
    "https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/starknet/fetchFile?file=prod-api/perps/perps_strk_grant.json"
  ).then((response) => response.json());

  const last = res.Carmine.at(-1);

  if (last) {
    return last.apr * 100;
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
