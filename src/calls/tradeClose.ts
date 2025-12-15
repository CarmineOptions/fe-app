import { Call } from "starknet";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";
import { Cubit, OptionWithUserPosition } from "@carmine-options/sdk/core";

export const tradeClose = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  option: OptionWithUserPosition,
  premia: Cubit,
  size: number
) => {
  try {
    const call = option.tradeClose(size, premia.val, 0.2);

    const res = await sendAsync(call);

    if (res?.transaction_hash) {
      const hash = res.transaction_hash;
      addTx(hash, option.optionId, TransactionAction.TradeClose);
      afterTransaction(
        hash,
        () => {
          markTxAsDone(hash);
          invalidatePositions();
          toast.success("Position closed successfully");
        },
        () => {
          markTxAsFailed(hash);
          toast.error("Position closed failed");
        }
      );
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
