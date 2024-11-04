import { AccountInterface } from "starknet";
import { OptionWithPosition } from "../classes/Option";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";

export const tradeSettle = async (
  account: AccountInterface,
  option: OptionWithPosition
) => {
  try {
    const res = await account.execute(option.tradeSettleCalldata);
    if (res?.transaction_hash) {
      const hash = res.transaction_hash;
      addTx(hash, option.optionId, TransactionAction.Settle);
      afterTransaction(
        res.transaction_hash,
        () => {
          markTxAsDone(hash);
          invalidatePositions();
        },
        () => {
          markTxAsFailed(hash);
        }
      );
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
