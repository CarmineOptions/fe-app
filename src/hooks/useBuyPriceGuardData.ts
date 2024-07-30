import { BuyPriceGuardModalData } from "../components/PriceGuard/BuyPriceGuardModal";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useBuyPriceGuardData = (): BuyPriceGuardModalData | undefined =>
  useSelector((s: RootState) => s.ui.buyPriceGuardModalData);
