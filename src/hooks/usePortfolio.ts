import { useSelector } from "react-redux";

import { PortfolioParamType } from "../redux/reducers/ui";
import { RootState } from "../redux/store";

export const usePortfolioParam = (): PortfolioParamType | undefined  =>
useSelector((s: RootState) => s.ui.portfolioParam);

