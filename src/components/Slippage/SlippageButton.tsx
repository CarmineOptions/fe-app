import { CSSProperties } from "react";
import { useSlippage } from "../../hooks/useSlippage";
import { openSlippageDialog } from "../../redux/actions";
import { useTheme } from "@mui/material";

export const SlippageButton = () => {
  const currentSlippage = useSlippage();
  const theme = useTheme();

  const style: CSSProperties = {
    color: theme.palette.secondary.main,
    cursor: "pointer",
  };

  return (
    <div style={style} onClick={openSlippageDialog}>
      Slippage {currentSlippage}%
    </div>
  );
};
