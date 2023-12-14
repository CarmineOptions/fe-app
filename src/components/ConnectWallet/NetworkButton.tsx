import { Button } from "@mui/material";

import { useSlippage } from "../../hooks/useSlippage";
import { openSlippageDialog } from "../../redux/actions";
import { NetworkName } from "../../types/network";
import { updateSettings } from "../../redux/actions";

export const NetworkButton = () => {
  const changeNetwork = () => {
        updateSettings({ network: NetworkName.Mainnet });
        window.location.reload();
  }
  return (
    <Button variant="contained" onClick={changeNetwork}>
      Switch to Mainnet
    </Button>
  );
};
