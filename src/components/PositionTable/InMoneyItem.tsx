import { OptionWithPosition } from "../../classes/Option";
import { TableCell, TableRow, Tooltip } from "@mui/material";
import { debug } from "../../utils/debugger";
import { tradeSettle } from "../../calls/tradeSettle";
import { invalidatePositions } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import { useAccount } from "@starknet-react/core";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";

type Props = {
  option: OptionWithPosition;
};

export const InMoneyItem = ({ option }: Props) => {
  const txPending = useTxPending(option.optionId, TransactionAction.Settle);
  const { account } = useAccount();

  const handleSettle = () => {
    if (!account || !option?.sizeHex) {
      debug("Could not trade close", { account, option });
      return;
    }

    tradeSettle(account, option)
      .then((res) => {
        if (res?.transaction_hash) {
          afterTransaction(res.transaction_hash, () => {
            invalidatePositions();
            showToast("Successfully settled position", ToastType.Success);
          });
        }
      })
      .catch(() => {
        showToast("Successfully settled position", ToastType.Error);
      });
  };

  const decimals = 4;

  return (
    <TableRow>
      <TableCell>{option.name}</TableCell>
      <TableCell>{option.sideAsText}</TableCell>
      <TableCell>{`$${option.strike}`}</TableCell>
      <TableCell>{option.dateShort}</TableCell>
      <TableCell>{option.size.toFixed(decimals)}</TableCell>
      <TableCell>
        <Tooltip title={option.value}>
          <span>
            {option.symbol} {option.value.toFixed(decimals)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <button
          className={buttonStyles.green}
          onClick={handleSettle}
          disabled={txPending}
        >
          {txPending ? "Processing..." : "Settle"}
        </button>
      </TableCell>
    </TableRow>
  );
};
