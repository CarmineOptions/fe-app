import { Call } from "starknet";
import { OptionWithPosition } from "../classes/Option";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { getPremiaWithSlippage } from "../utils/computations";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";

export const tradeClose = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  option: OptionWithPosition,
  premia: bigint,
  size: number,
  isClosing: boolean
) => {
  try {
    const premiaWithSlippage = getPremiaWithSlippage(
      premia,
      option.side,
      isClosing
    ).toString(10);

    const res = await sendAsync([
      option.tradeCloseCalldata(size, premiaWithSlippage),
    ]);

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
