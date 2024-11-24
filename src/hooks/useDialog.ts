import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useDialogOpen = (): boolean =>
  useSelector((s: RootState) => s.ui.dialogOpen);

export const useDialog = () => {
  const { dialogOpen, dialogContent } = useSelector((s: RootState) => s.ui);
  return { dialogOpen, dialogContent };
};
