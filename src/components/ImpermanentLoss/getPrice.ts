import { shortInteger } from "./../../utils/computations";
import { formatNumber } from "./../../utils/utils";
import { AccountInterface, BigNumberish, Call } from "starknet";
import { impLossContract } from "../../constants/starknet";
import { debug } from "../../utils/debugger";
import { balanceOf } from "../../calls/balanceOf";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { IMP_LOSS_ADDRESS } from "../../constants/amm";
import { TransactionState, TxTracking } from "../../types/network";
import { invalidatePositions } from "../../queries/client";
import { TransactionAction } from "../../redux/reducers/transactions";
import { ToastType } from "../../redux/reducers/ui";
import { afterTransaction } from "../../utils/blockchain";
import { Pair } from "../../classes/Pair";

type ILResponse = {
  0: bigint;
  1: bigint;
};

export type ILPrice = {
  basePrice: bigint;
  quotePrice: bigint;
};

export const getPrice = async (
  sizeRaw: BigNumberish,
  tokenPair: Pair,
  expiry: number,
  signal: AbortSignal
): Promise<ILPrice | undefined> => {
  const res = (await impLossContract
    .call("price_hedge", [
      sizeRaw,
      tokenPair.quoteToken.address,
      tokenPair.baseToken.address,
      expiry,
    ])
    .catch((e: Error) => {
      debug("Failed getting IMP LOSS price", e.message);
      throw Error(e.message);
    })) as ILResponse;

  if (signal.aborted) {
    return;
  }

  return {
    basePrice: res[1],
    quotePrice: res[0],
  };
};

export const buyImpLoss = async (
  account: AccountInterface,
  sizeRaw: BigNumberish,
  tokenPair: Pair,
  expiry: number,
  price: ILPrice,
  setTxStatus: TxTracking
) => {
  setTxStatus(TransactionState.Processing);
  const [baseBalance, quoteBalance] = await Promise.all([
    balanceOf(account.address, tokenPair.baseToken.address),
    balanceOf(account.address, tokenPair.quoteToken.address),
  ]);

  if (price.basePrice > baseBalance) {
    showToast(
      `Your balance is ${formatNumber(
        shortInteger(baseBalance, tokenPair.baseToken.decimals),
        5
      )} ${tokenPair.baseToken.symbol} and you need ${formatNumber(
        shortInteger(price.basePrice, tokenPair.quoteToken.decimals),
        5
      )}  ${tokenPair.baseToken.symbol}`,
      ToastType.Error
    );
    setTxStatus(TransactionState.Fail);
    return;
  }

  if (price.quotePrice > quoteBalance) {
    showToast(
      `Your balance is ${formatNumber(
        shortInteger(quoteBalance, tokenPair.quoteToken.decimals),
        5
      )} ${tokenPair.quoteToken.symbol} and you need ${formatNumber(
        shortInteger(price.quotePrice, tokenPair.quoteToken.decimals),
        5
      )} ${tokenPair.quoteToken.symbol}`,
      ToastType.Error
    );
    setTxStatus(TransactionState.Fail);
    return;
  }

  const getSizeWithSlippage = (size: bigint, slippage: bigint) => {
    return (size * (100n + slippage)) / 100n;
  };

  const approveBase: Call = {
    contractAddress: tokenPair.baseToken.address,
    entrypoint: "approve",
    calldata: [
      IMP_LOSS_ADDRESS,
      getSizeWithSlippage(price.basePrice, 10n).toString(10),
      "0",
    ],
  };

  const approveQuote: Call = {
    contractAddress: tokenPair.quoteToken.address,
    entrypoint: "approve",
    calldata: [
      IMP_LOSS_ADDRESS,
      getSizeWithSlippage(price.quotePrice, 10n).toString(10),
      "0",
    ],
  };

  const hedge: Call = {
    contractAddress: IMP_LOSS_ADDRESS,
    entrypoint: "hedge",
    calldata: [
      sizeRaw.toString(10),
      tokenPair.quoteToken.address,
      tokenPair.baseToken.address,
      expiry,
    ],
  };

  const res = await account
    .execute([approveBase, approveQuote, hedge])
    .catch((e) => {
      debug("ILHedge failed", e.message);
      setTxStatus(TransactionState.Fail);
      throw Error(e);
    });

  const id = tokenPair.pairId + expiry;
  const hash = res.transaction_hash;
  addTx(hash, id, TransactionAction.ImpLoss);
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      invalidatePositions();
      setTxStatus(TransactionState.Success);
      showToast("Successfully opened position", ToastType.Success);
    },
    () => {
      markTxAsFailed(hash);
      setTxStatus(TransactionState.Fail);
      showToast("Failed to open position", ToastType.Error);
    }
  );
};
