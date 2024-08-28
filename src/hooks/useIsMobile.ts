import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useIsMobile = (): boolean =>
  useSelector((s: RootState) => s.ui.isMobile);
