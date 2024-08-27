import { useQuery } from "react-query";
import { queryPoolCapital } from "../components/Yield/fetchStakeCapital";

export const usePoolInfo = (id: string) =>
  useQuery([`pool-data-${id}`, id], queryPoolCapital);
