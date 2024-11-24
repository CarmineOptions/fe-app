import { useSelector } from "react-redux";

import { GovernanceSubpage } from "../redux/reducers/ui";
import { RootState } from "../redux/store";

export const useGovernanceSubpage = (): GovernanceSubpage =>
  useSelector((s: RootState) => s.ui.governanceSubpage);
