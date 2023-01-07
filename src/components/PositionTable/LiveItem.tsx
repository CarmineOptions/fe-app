import {
  CompositeOption,
  OptionSide,
  OptionType,
  ParsedOptionWithPosition,
} from "../../types/options";
import { timestampToReadableDate } from "../../utils/utils";
import {
  Button,
  ButtonGroup,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { debug } from "../../utils/debugger";
import { tradeClose } from "../../calls/tradeClose";
import { useAccount } from "@starknet-react/core";
import BN from "bn.js";
import { useState } from "react";
import { BASE_MATH_64_61 } from "../../constants/amm";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { afterTransaction } from "../../utils/blockchain";
import { invalidatePositions } from "../../queries/client";

type Props = {
  option: CompositeOption;
};

export const LiveItem = ({ option }: Props) => {
  const [amount, setAmount] = useState<number>(0.0);
  const [text, setText] = useState<string>("0");
  const [processing, setProcessing] = useState<boolean>(false);
  const cb = (n: number): number => (n > positionSize ? positionSize : n);
  const handleChange = handleNumericChangeFactory(setText, setAmount, cb);
  const { account } = useAccount();

  const {
    strikePrice,
    optionSide,
    optionType,
    maturity,
    positionSize,
    positionValue,
  } = option.parsed as ParsedOptionWithPosition;
  const msMaturity = maturity * 1000;

  const date = timestampToReadableDate(msMaturity);
  const typeText = optionType === OptionType.Put ? "Put" : "Call";
  const sideText = optionSide === OptionSide.Long ? "Long" : "Short";
  const currency = optionType === OptionType.Put ? "USD" : "ETH";

  const desc = `${sideText} ${typeText} with strike $${strikePrice}`;
  const decimals = 4;
  const timeNow = new Date().getTime();
  const isExpired = msMaturity - timeNow <= 0;

  const close = (amount: string) => {
    if (!account || !option?.raw?.position_size || !amount) {
      debug("Could not trade close", { account, raw: option?.raw, amount });
      return;
    }

    setProcessing(true);

    tradeClose(account, option.raw, amount)
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            setProcessing(false);
          });
        }
      })
      .catch(() => {
        setProcessing(false);
      });
  };

  const handleClose = () => {
    const precission = 10000;
    const size64x61 = new BN(amount * precission)
      .mul(BASE_MATH_64_61)
      .div(new BN(precission))
      .toString(10);
    close(size64x61);
  };

  const handleCloseAll = () => {
    if (!option?.raw?.position_size) {
      return;
    }
    const size64x61 = new BN(option.raw.position_size).toString(10);
    close(size64x61);
  };

  return (
    <TableRow>
      <TableCell>{desc}</TableCell>
      <TableCell>{isExpired ? `Expired on ${date}` : date}</TableCell>
      <TableCell>{positionSize.toFixed(decimals)}</TableCell>
      <TableCell>
        <Tooltip title={positionValue}>
          <span>
            {currency} {positionValue.toFixed(decimals)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }}>
        <TextField
          id="outlined-number"
          label="Amount"
          size="small"
          value={text}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            inputMode: "decimal",
          }}
          onChange={handleChange}
        />
      </TableCell>
      <TableCell align="right">
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          disabled={processing}
        >
          {processing ? (
            <Button>Processing...</Button>
          ) : (
            <>
              <Button onClick={handleClose}>Close</Button>
              <Button onClick={handleCloseAll}>Max</Button>
            </>
          )}
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
