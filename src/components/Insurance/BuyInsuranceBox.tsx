import { useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useCurrency } from "../../hooks/useCurrency";
import { LoadingAnimation } from "../Loading/Loading";
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { shortInteger } from "../../utils/computations";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import {
  timestampToInsuranceDate,
  uniquePrimitiveValues,
} from "../../utils/utils";
import { debug } from "../../utils/debugger";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import {
  openBuyInsuranceDialog,
  setBuyInsuranceModal,
  showToast,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { Option } from "../../classes/Option";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import tableStyles from "../../style/table.module.css";
import buttonStyles from "../../style/button.module.css";
import { selectNoBorder } from "../../style/sx";
import { Token, TokenKey } from "../../classes/Token";

type BuyButtonProps = {
  option: Option;
  size: number;
};

const PlusIcon = () => (
  <span
    style={{
      position: "absolute",
      color: "#00FF38",
      fontSize: "20px",
    }}
  >
    +
  </span>
);

const BuyInsuranceButton = ({ option, size }: BuyButtonProps) => {
  const txPending = useTxPending(option.optionId, TransactionAction.TradeOpen);
  const handleButtonClick = () => {
    if (size === 0) {
      showToast("Please select size greater than 0", ToastType.Warn);
      return;
    }
    if (!option) {
      showToast("Select an insurance first", ToastType.Warn);
      return;
    }
    debug("Buying this option", option, "with size", size);
    setBuyInsuranceModal({ option: option, size });
    option.sendViewEvent(true);
    openBuyInsuranceDialog();
  };

  return (
    <button
      className={buttonStyles.secondary}
      disabled={txPending}
      onClick={handleButtonClick}
    >
      {txPending ? "Processing" : "Buy"}
    </button>
  );
};

export const BuyInsuranceBox = () => {
  const account = useAccount();
  const balance = useUserBalance();
  const [currency, setCurrency] = useState<TokenKey>(TokenKey.ETH);
  const token = Token.byKey(currency);
  const displayBalance = balance
    ? shortInteger(balance[currency].toString(10), token.decimals).toFixed(4)
    : undefined;
  const valueInUsd = useCurrency(currency);
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("0");
  const [interacted, setInteracted] = useState(false);
  const [expiry, setExpiry] = useState<number>();

  if (valueInUsd === undefined || isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return (
      <Typography>Something went wrong, please try again later</Typography>
    );
  }

  if (displayBalance && !interacted) {
    // if no interaction with input, set size to user balance
    setSize(parseFloat(displayBalance));
    setTextSize(displayBalance);
    setInteracted(true);
  }

  const options = data.filter(
    // only Long Puts for the chosen currency
    (o) => o.baseToken.id === currency && o.isPut && o.isLong && o.isFresh
  );

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as TokenKey);
  };
  const handleStrikeChange = (event: SelectChangeEvent) => {
    setCurrentStrike(parseInt(event.target.value) as number);
  };
  const handleExpiryChange = (event: SelectChangeEvent) => {
    setExpiry(parseInt(event.target.value) as number);
  };
  const handleSizeChange = handleNumericChangeFactory(
    setTextSize,
    setSize,
    (n) => {
      setInteracted(true);
      return n;
    }
  );

  // show all expiries
  const expiries = options
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues)
    .sort();

  if (options.length > 0 && !expiry) {
    setExpiry(expiries[0]);
  }

  // // show strikes for current expiry
  const strikes = options
    .filter((o) => o.maturity === expiry)
    .map((o) => o.strike)
    .filter(uniquePrimitiveValues)
    .sort();

  if (
    options.length > 0 &&
    (!currentStrike || !strikes.includes(currentStrike))
  ) {
    setCurrentStrike(strikes[0]);
  }

  const pickedOption = options.find(
    (o) => o.maturity === expiry && o.strike === currentStrike
  )!;

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Table className={tableStyles.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>{token.symbol}&nbsp;price</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Price&nbsp;to&nbsp;Insure</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Select
                sx={selectNoBorder}
                inputProps={{
                  IconComponent: PlusIcon,
                  sx: { paddingRight: 0 },
                }}
                value={currency}
                onChange={handleCurrencyChange}
              >
                <MenuItem value={TokenKey.ETH}>ETH</MenuItem>
                <MenuItem value={TokenKey.BTC}>BTC</MenuItem>
              </Select>
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {!account
                ? "--"
                : !balance
                ? "loading"
                : `${displayBalance} ${token.symbol}`}
            </TableCell>
            <TableCell>{valueInUsd ? `$${valueInUsd}` : "loading"}</TableCell>
            <TableCell>
              <Select
                sx={selectNoBorder}
                value={expiry ? expiry + "" : undefined}
                inputProps={{
                  IconComponent: PlusIcon,
                }}
                onChange={handleExpiryChange}
              >
                {expiries.map((e, i) => (
                  <MenuItem key={i} value={e}>
                    {timestampToInsuranceDate(e * 1000)}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell>
              <Select
                sx={selectNoBorder}
                inputProps={{ IconComponent: PlusIcon }}
                value={"" + currentStrike}
                onChange={handleStrikeChange}
              >
                {strikes.map((s) => (
                  <MenuItem key={s} value={s}>
                    ${s}
                  </MenuItem>
                ))}
              </Select>
            </TableCell>
            <TableCell sx={{ display: "flex", alignItems: "center" }}>
              <PlusIcon />
              <TextField
                value={textSize}
                sx={selectNoBorder}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  inputMode: "decimal",
                }}
                onChange={handleSizeChange}
              />
            </TableCell>
            <TableCell>
              {options.length > 0 && account && (
                <BuyInsuranceButton option={pickedOption} size={size} />
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {options.length === 0 && (
        <Typography>
          We currently do not have any available insurance, please try again
          later
        </Typography>
      )}
      {!account && <Typography>Connect wallet to buy insurance</Typography>}
    </Box>
  );
};
