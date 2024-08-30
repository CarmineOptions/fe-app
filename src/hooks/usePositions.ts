import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "./useAccount";
import { fetchPositions } from "../components/PositionTable/fetchPositions";

export const usePositions = () => {
  const account = useAccount();

  const key = `${QueryKeys.position}-${account?.address}`;

  return useQuery([key, account?.address], fetchPositions);
};
