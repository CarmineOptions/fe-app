import { OptionWithPosition } from "../../classes/Option";
import { timestampToReadableDate } from "../../utils/utils";
import { TableCell, TableRow } from "@mui/material";
import { debug } from "../../utils/debugger";
import { tradeSettle } from "../../calls/tradeSettle";
import { invalidatePositions } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import { useAccount } from "../../hooks/useAccount";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";

type Props = {
  option: OptionWithPosition;
};

export const OutOfMoneyItem = ({ option }: Props) => {
  const txPending = useTxPending(option.optionId, TransactionAction.Settle);
  const account = useAccount();

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

  const { strike, maturity, size } = option;
  const msMaturity = maturity * 1000;

  const date = timestampToReadableDate(msMaturity);
  const desc = `$${strike} ${option.name}`;
  const decimals = 4;

  return (
    <TableRow>
      <TableCell>{desc}</TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>{size.toFixed(decimals)}</TableCell>
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
