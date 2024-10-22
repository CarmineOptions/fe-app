import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { fetchPositions } from "../components/PositionTable/fetchPositions";
import { useAccount } from "@starknet-react/core";

export const usePositions = () => {
  const { account } = useAccount();

  const key = `${QueryKeys.position}-${account?.address}`;

  return useQuery([key, account?.address], fetchPositions);
};
