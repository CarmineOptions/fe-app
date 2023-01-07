import {
  Button,
  ButtonGroup,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { AccountInterface } from "starknet";
import { withdrawCall } from "./withdrawCall";
import { OptionType } from "../../types/options";
import { handleNumericChangeFactory } from "../../utils/inputHandling";

type Props = {
  account: AccountInterface;
  size: number;
  value: number;
  type: OptionType;
};

export const WithdrawItem = ({ account, size, value, type }: Props) => {
  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>("0");
  const [processing, setProcessing] = useState<boolean>(false);

  const cb = (n: number): number => (n >= size ? size : n);
  const handleChange = handleNumericChangeFactory(setText, setAmount, cb);
  const handleWithdraw = () =>
    withdrawCall(account, amount, type, setProcessing);
  const handleWithdrawAll = () =>
    withdrawCall(account, size, type, setProcessing);

  const pool = type === OptionType.Call ? "Call" : "Put";

  return (
    <TableRow>
      <TableCell>{pool}</TableCell>
      <TableCell>{value}</TableCell>
      <TableCell>{size}</TableCell>
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
              <Button onClick={handleWithdraw}>Withdraw</Button>
              <Button onClick={handleWithdrawAll}>Max</Button>
            </>
          )}
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
