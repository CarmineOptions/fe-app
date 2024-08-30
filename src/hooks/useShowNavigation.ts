import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useShowNavigation = (): boolean =>
  useSelector((s: RootState) => s.ui.showNavigation);
