import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { OptionWithPosition } from "../classes/Option";

export const useCloseOption = (): OptionWithPosition | undefined =>
  useSelector((s: RootState) => s.ui.activeCloseOption);
