import {
  ButtonGroup,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { withdrawCall } from "./withdrawCall";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";
import { UserPoolInfo } from "../../classes/Pool";
import { useSendTransaction } from "@starknet-react/core";

type Props = {
  userPoolInfo: UserPoolInfo;
};

export const WithdrawItem = ({ userPoolInfo }: Props) => {
  const { sendAsync } = useSendTransaction({});
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
    withdrawCall(sendAsync, setProcessing, userPoolInfo, amount);
  };
  const handleWithdrawAll = () =>
    withdrawCall(sendAsync, setProcessing, userPoolInfo, "all");

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
        <input type="text" value={text} onChange={handleChange} />
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
