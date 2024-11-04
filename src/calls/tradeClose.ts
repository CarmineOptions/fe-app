import { AccountInterface } from "starknet";
import { OptionWithPosition } from "../classes/Option";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { getPremiaWithSlippage } from "../utils/computations";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { ToastType } from "../redux/reducers/ui";

export const tradeClose = async (
  account: AccountInterface,
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

    const res = await account.execute(
      option.tradeCloseCalldata(size, premiaWithSlippage)
    );

    if (res?.transaction_hash) {
      const hash = res.transaction_hash;
      addTx(hash, option.optionId, TransactionAction.TradeClose);
      afterTransaction(
        hash,
        () => {
          markTxAsDone(hash);
          invalidatePositions();
          showToast("Position closed successfully", ToastType.Success);
        },
        () => {
          markTxAsFailed(hash);
          showToast("Position closed failed", ToastType.Error);
        }
      );
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
