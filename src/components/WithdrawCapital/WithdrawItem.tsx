import {
  ButtonGroup,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AccountInterface } from "starknet";
import { withdrawCall } from "./withdrawCall";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";
import { UserPoolInfo } from "../../classes/Pool";
import inputStyle from "../../style/input.module.css";

type Props = {
  userPoolInfo: UserPoolInfo;
  account: AccountInterface;
};

export const WithdrawItem = ({ account, userPoolInfo }: Props) => {
  const { value } = userPoolInfo;

  const txPending = useTxPending(
    userPoolInfo.poolId,
    TransactionAction.Withdraw
  );
  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>("0");
  const [processing, setProcessing] = useState<boolean>(false);

  const handleChange = handleNumericChangeFactory(setText, setAmount);

  const handleWithdraw = () => {
    if (!amount) {
      showToast("Cannot withdraw 0", ToastType.Warn);
      return;
    }
    withdrawCall(account, setProcessing, userPoolInfo, amount);
  };
  const handleWithdrawAll = () =>
    withdrawCall(account, setProcessing, userPoolInfo, "all");

  const displayDigits = 5;

  return (
    <TableRow>
      <TableCell>{userPoolInfo.name}</TableCell>
      <TableCell>
        <Tooltip title={value}>
          <Typography>{value.toFixed(displayDigits)}</Typography>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }}>
        <input
          className={inputStyle.input}
          type="text"
          value={text}
          onChange={handleChange}
        />
      </TableCell>
      <TableCell align="right">
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          disabled={processing || txPending}
        >
          {processing || txPending ? (
            <button className={buttonStyles.secondary}>Processing...</button>
          ) : (
            <>
              <button
                style={{ borderRight: 0 }}
                className={buttonStyles.secondary}
                onClick={handleWithdraw}
              >
                Unstake
              </button>
              <button
                className={buttonStyles.secondary}
                onClick={handleWithdrawAll}
              >
                Max
              </button>
            </>
          )}
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
