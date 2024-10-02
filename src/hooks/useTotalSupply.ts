import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { queryTotalSupply } from "../calls/totalSupply";

export const useTotalSupply = (address: string) => {
  const key = `${QueryKeys.totalSupply}-${address}`;

  return useQuery([key, address], queryTotalSupply);
};
