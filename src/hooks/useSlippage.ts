import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useSlippage = (): number =>
  useSelector((s: RootState) => s.settings.slippage);
