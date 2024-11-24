import { useSelector } from "react-redux";

import { RootState } from "../redux/store";
import { NetworkName } from "../types/network";

export const useNetwork = (): NetworkName =>
  useSelector((s: RootState) => s.settings.network);
