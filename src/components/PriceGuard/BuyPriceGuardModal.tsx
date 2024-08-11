import { Box, Tooltip, Typography } from "@mui/material";
import { usePremiaQuery } from "../../hooks/usePremiaQuery";
import { CustomDialogTitle } from "../MultiDialog/MultiDialog";
import { math64toDecimal } from "../../utils/units";
import { getPremiaWithSlippage } from "../../utils/computations";
import { useAccount } from "../../hooks/useAccount";
import { store } from "../../redux/store";
import { Option } from "../../classes/Option";
import { useBuyPriceGuardData } from "../../hooks/useBuyPriceGuardData";
import { LoadingAnimation } from "../Loading/Loading";
import { useState } from "react";
import { TradeState } from "../TradeTable/TradeCard";
import { approveAndTradeOpen } from "../../calls/tradeOpen";
import { useUserBalance } from "../../hooks/useUserBalance";
import buttonStyles from "../../style/button.module.css";

export type BuyPriceGuardModalData = {
  option: Option;
  size: number;
};

type Props = {
  option: Option;
  size: number;
  updateTradeState: ({
    failed,
    processing,
  }: {
    failed: boolean;
    processing: boolean;
  }) => void;
};

const WithOption = ({ option, size, updateTradeState }: Props) => {
  const account = useAccount();
  const balance = useUserBalance(option.underlying.address);

  const {
    data: premiaMath64,
    error,
    isFetching,
  } = usePremiaQuery(option, size, false);

  if (isFetching || !balance) {
    // loading...
    return <LoadingAnimation />;
  }

  if (typeof premiaMath64 === "undefined" || error) {
    // no data
    return (
      <Typography>
        Something went wrong while fetching data, please try again
      </Typography>
    );
  }

  const premiaNumber = math64toDecimal(premiaMath64);
  const premiaWithSlippage = getPremiaWithSlippage(
    premiaMath64,
    option.side,
    false
  );
  const displayPremiaWithSlippage = math64toDecimal(premiaWithSlippage);
  const slippage = store.getState().settings.slippage;

  const handleClick = () =>
    approveAndTradeOpen(
      account!,
      option,
      size,
      premiaNumber,
      premiaWithSlippage,
      balance,
      updateTradeState,
      true
    );

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
      }}
    >
      <Box
        sx={{
          my: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "1.2rem" }}>PriceGuard price</Typography>
          <Tooltip title={`$${premiaNumber}`} placement="top">
            <Typography sx={{ fontSize: "1.2rem" }}>
              ${premiaNumber.toFixed(2)}
            </Typography>
          </Tooltip>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "1rem" }} variant="caption">
            Slippage {slippage}% limit
          </Typography>
          <Tooltip title={`$${displayPremiaWithSlippage}`}>
            <Typography sx={{ fontSize: "1rem" }} variant="caption">
              ${displayPremiaWithSlippage.toFixed(2)}
            </Typography>
          </Tooltip>
        </Box>
      </Box>
      <button
        className={buttonStyles.green}
        disabled={!account}
        onClick={handleClick}
      >
        Buy PriceGuard
      </button>
    </Box>
  );
};

export const BuyPriceGuardModal = () => {
  const data = useBuyPriceGuardData();
  const [tradeState, updateTradeState] = useState<TradeState>({
    failed: false,
    processing: false,
  });

  const containerSx = { minWidth: "300px", p: 2 };

  if (!data) {
    return (
      <Box sx={containerSx}>
        <CustomDialogTitle title="Buy PriceGuard" />
        There was a problem, please try again
      </Box>
    );
  }

  if (tradeState.failed) {
    return (
      <Box sx={containerSx}>
        <CustomDialogTitle title="Buy PriceGuard" />
        <Typography>Transaction failed, please try again</Typography>
      </Box>
    );
  }

  if (tradeState.processing) {
    return (
      <Box sx={containerSx}>
        <CustomDialogTitle title="Buy PriceGuard" />
        <Typography>
          Transaction is being processed, you can close this modal.
        </Typography>
        <Typography>
          You can find the transaction in <i>Recent Transactions</i> by clicking
          wallet button in the top right corner.
        </Typography>
      </Box>
    );
  }

  const { option, size } = data;

  const title = `Buy Price Guard for ${size} ${option.baseToken.symbol}`;

  return (
    <Box sx={containerSx}>
      <CustomDialogTitle title={title} />
      <Typography>Price Guard will expire on {option.dateRich}</Typography>
      <WithOption
        option={option}
        size={size}
        updateTradeState={updateTradeState}
      />
    </Box>
  );
};
