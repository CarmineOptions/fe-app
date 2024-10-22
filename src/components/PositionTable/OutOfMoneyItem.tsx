import { OptionWithPosition } from "../../classes/Option";
import { TableCell, TableRow } from "@mui/material";
import { debug } from "../../utils/debugger";
import { tradeSettle } from "../../calls/tradeSettle";
import { invalidatePositions } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import { useAccount } from "@starknet-react/core";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";

type Props = {
  option: OptionWithPosition;
};

export const OutOfMoneyItem = ({ option }: Props) => {
  const txPending = useTxPending(option.optionId, TransactionAction.Settle);
  const { account } = useAccount();

  const handleSettle = () => {
    if (!account || !option?.size) {
      debug("Could not trade close", { account, option });
      return;
    }

    tradeSettle(account, option).then((res) => {
      if (res?.transaction_hash) {
        afterTransaction(res.transaction_hash, () => {
          invalidatePositions();
        });
      }
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
