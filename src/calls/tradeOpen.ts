import { addTx, markTxAsDone, markTxAsFailed } from "./../redux/actions";
import { Call } from "starknet";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";

import { debug } from "../utils/debugger";
import { shortInteger } from "../utils/computations";
import { afterTransaction } from "../utils/blockchain";
import { invalidatePositions } from "../queries/client";
import { TransactionAction } from "../redux/reducers/transactions";
import { math64ToInt } from "../utils/units";
import { apiUrl } from "../api";
import { isMainnet } from "../constants/amm";
import { TransactionState, TxTracking } from "../types/network";
import { Cubit, Option } from "carmine-sdk/core";

export const approveAndTradeOpen = async (
  address: string,
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  option: Option,
  size: number,
  premiaNum: number,
  premiaMath64: bigint,
  balance: bigint | undefined,
  updateTradeState: ({
    failed,
    processing,
  }: {
    failed: boolean;
    processing: boolean;
  }) => void,
  isPriceGuard = false
): Promise<boolean> => {
  const premiaTokenCount = math64ToInt(
    premiaMath64,
    option.underlying.decimals
  );
  const toApprove = option.toApprove(size, premiaNum, 0.2, false).low;
  const toApproveNumber = option.underlying.toHumanReadable(toApprove);

  debug({ premiaMath64, toApprove, toApproveNumber });

  if (balance === undefined) {
    return false;
  }

  if (balance < toApprove) {
    const [has, needs] = [
      shortInteger(balance.toString(10), option.underlying.decimals),
      toApproveNumber,
    ];
    debug({
      size,
      premiaMath64,
      premiaTokenCount,
      toApproveNumber,
      has,
      needs,
    });
    toast(
      `To open this position you need ${option.underlying.symbol}\u00A0${Number(
        needs
      ).toFixed(4)}, but you only have ${
        option.underlying.symbol
      }\u00A0${has.toFixed(4)}`
    );
    throw Error("Not enough funds");
  }

  const tradeOpen = option.tradeOpen(size, premiaNum, 0.2);

  if (isPriceGuard && isMainnet) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: address,
        calldata: tradeOpen[1].calldata,
      }),
    };

    fetch(apiUrl("insurance-event"), options)
      .then((response) => {
        debug("PriceGuard event sent", response);
      })
      .catch((err) => {
        debug("PriceGuard event failed", err);
        console.error(err);
      });
  }

  const res = await sendAsync(tradeOpen).catch((e) => {
    debug("Trade open rejected or failed", e.message);
    throw Error("Trade open rejected or failed");
  });

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;
    addTx(
      hash,
      option.lpAddress +
        option.optionSide +
        option.maturity +
        option.strikePrice.val,
      TransactionAction.TradeOpen
    );
    afterTransaction(
      hash,
      () => {
        markTxAsDone(hash);
        invalidatePositions();
        updateTradeState({
          failed: false,
          processing: false,
        });
        toast.success("Successfully opened position");
      },
      () => {
        markTxAsFailed(hash);
        updateTradeState({
          failed: true,
          processing: false,
        });
        toast.error("Failed to open position");
      }
    );
  } else {
    throw Error("Trade open failed unexpectedly");
  }

  return true;
};

export const approveAndTradeOpenNew = async (
  address: string,
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  option: Option,
  size: number,
  premia: Cubit,
  balance: bigint,
  updateTradeState: TxTracking,
  isPriceGuard = false,
  callback?: (tx: string) => void
) => {
  if (size === 0) {
    toast("Cannot open position with size 0");
    return;
  }
  updateTradeState(TransactionState.Processing);
  const toApprove = option.toApprove(size, premia.val, 0.2, false).low;
  const toApproveNumber = option.underlying.toHumanReadable(toApprove);

  if (balance < toApprove) {
    const [has, needs] = [
      shortInteger(balance.toString(10), option.underlying.decimals),
      toApproveNumber,
    ];
    toast(
      `To open this position you need ${option.underlying.symbol}\u00A0${Number(
        needs
      ).toFixed(4)}, but you only have ${
        option.underlying.symbol
      }\u00A0${has.toFixed(4)}`
    );
    updateTradeState(TransactionState.Fail);
    return;
  }

  const tradeOpen = option.tradeOpen(size, premia.val, 0.2);

  if (isPriceGuard && isMainnet) {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: address,
        calldata: tradeOpen[1].calldata,
      }),
    };

    fetch(apiUrl("insurance-event"), options)
      .then((response) => {
        debug("PriceGuard event sent", response);
      })
      .catch((err) => {
        debug("PriceGuard event failed", err);
        console.error(err);
      });
  }

  const res = await sendAsync(tradeOpen).catch((e) => {
    debug("Trade open rejected or failed", e.message);
  });

  if (res === undefined) {
    updateTradeState(TransactionState.Fail);
    return;
  }

  const hash = res.transaction_hash;
  addTx(
    hash,
    option.lpAddress +
      option.optionSide +
      option.maturity +
      option.strikePrice.val,
    TransactionAction.TradeOpen
  );
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      invalidatePositions();
      updateTradeState(TransactionState.Success);
      toast.success("Successfully opened position");
      if (callback) {
        callback(hash);
      }
    },
    () => {
      markTxAsFailed(hash);
      updateTradeState(TransactionState.Fail);
      toast.error("Failed to open position");
    }
  );
};
