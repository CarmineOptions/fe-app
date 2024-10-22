import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { fetchCapital } from "../components/WithdrawCapital/fetchCapital";
import { useAccount } from "@starknet-react/core";

export const useStakes = () => {
  const { account } = useAccount();

  const key = `${QueryKeys.stake}-${account?.address}`;

  return useQuery([key, account?.address], fetchCapital);
};
