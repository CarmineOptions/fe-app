import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "./useAccount";
import { fetchCapital } from "../components/WithdrawCapital/fetchCapital";

export const useStakes = () => {
  const account = useAccount();

  const key = `${QueryKeys.stake}-${account?.address}`;

  return useQuery([key, account?.address], fetchCapital);
};
