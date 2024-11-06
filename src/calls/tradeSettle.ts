import { OptionWithPosition } from "../classes/Option";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { Call } from "starknet";
import { RequestResult } from "@starknet-react/core";

export const tradeSettle = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  option: OptionWithPosition
) => {
  try {
    const res = await sendAsync([option.tradeSettleCalldata]);
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
