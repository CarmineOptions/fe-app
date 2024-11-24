import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useCurrentChainId = (): string =>
  useSelector((s: RootState) => s.network.network.chainId);
