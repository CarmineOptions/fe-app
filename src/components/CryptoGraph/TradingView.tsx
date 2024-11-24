import { Box, useTheme } from "@mui/material";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

export const ComplexGraph = () => {
  const theme = useTheme();
  const boxStyle = {
    [theme.breakpoints.down("md")]: {
      aspectRatio: "1 / 1",
    },
    [theme.breakpoints.up("md")]: {
      aspectRatio: "5 / 2",
    },
    paddingBottom: "40px",
    border: "1px solid",
    borderColor: theme.palette.divider,
  };
  return (
    <Box sx={boxStyle}>
      <AdvancedRealTimeChart
        autosize
        theme={theme.palette.mode}
        symbol="BINANCE:ETHUSD"
        interval="5"
        range="1D"
        timezone="Europe/Berlin"
        // eslint-disable-next-line react/style-prop-object
        style="1" // conflict with react style and trading view style
        locale="en"
        allow_symbol_change
        hide_side_toolbar
      />
    </Box>
  );
};
