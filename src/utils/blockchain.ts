import { Contract } from "starknet";
import AmmAbi from "../abi/amm_abi.json";
import GovernanceAbi from "../abi/governance_abi.json";
import { AMM_ADDRESS, GOVERNANCE_ADDRESS } from "../constants/amm";
import { provider } from "../network/provider";
import { RequestResult } from "@starknet-react/core";
import {
  Call,
  GetTransactionReceiptResponse,
  ProviderInterface,
  ReceiptTx,
  SuccessfulTransactionReceiptResponse,
} from "starknet";

export const AMMContract = new Contract({
  abi: AmmAbi,
  address: AMM_ADDRESS,
  providerOrAccount: provider,
});

export const GovernanceContract = new Contract({
  abi: GovernanceAbi,
  address: GOVERNANCE_ADDRESS,
  providerOrAccount: provider,
});

export const afterTransaction = (
  tx: string,
  ok: () => void,
  nok?: () => void
) => {
  provider.waitForTransaction(tx).then(ok).catch(nok);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SyncOrAsyncVoidFunction<TArgs extends any[] = [], TResult = void> = (
  ...args: TArgs
) => TResult | Promise<TResult>;

export interface ExecuteHooks {
  preExecute?: SyncOrAsyncVoidFunction<[Call[]]>;
  preAwait?: SyncOrAsyncVoidFunction<
    [RequestResult<"wallet_addInvokeTransaction">]
  >;
  postAwait?: SyncOrAsyncVoidFunction<[GetTransactionReceiptResponse]>;
  onSuccess?: SyncOrAsyncVoidFunction<
    [SuccessfulTransactionReceiptResponse & ReceiptTx]
  >;
  onReject?: SyncOrAsyncVoidFunction;
}

export interface ExecuteBase {
  // this would normally be account.execute, but there is a third party library error
  // sendAsync must be used instead - this abstraction allows for easy switching between the 2
  executeFunc: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>;
  provider: ProviderInterface;
  hooks?: ExecuteHooks;
}

interface ExecuteArguments extends ExecuteBase {
  calls: Call[];
}

interface ApproveArguments {
  tokenAddress: string;
  spender: string;
  amount: bigint;
}

export type ExecuteResponse = Promise<GetTransactionReceiptResponse>;

type Execute = (args: ExecuteArguments) => ExecuteResponse;

type GenerateApproveCall = (args: ApproveArguments) => Call;

export const _execute: Execute = async ({
  calls,
  executeFunc,
  provider,
  hooks,
}) => {
  console.log("executing", calls);
  if (hooks?.preExecute) {
    await hooks.preExecute(calls);
  }
  const executeResult = await executeFunc(calls);
  console.log("execute result", executeResult);
  if (hooks?.preAwait) {
    await hooks.preAwait(executeResult);
  }
  const awaitedTransaction = await provider.waitForTransaction(
    executeResult.transaction_hash
  );
  console.log("awaited transaction", awaitedTransaction);
  if (hooks?.postAwait) {
    await hooks.postAwait(awaitedTransaction);
  }

  if (awaitedTransaction.isSuccess()) {
    if (hooks?.onSuccess) {
      await hooks.onSuccess(awaitedTransaction);
    }
    return awaitedTransaction;
  }

  console.error("Transaction rejected or reverted", awaitedTransaction);
  // if (hooks?.onReject) {
  //   await hooks.onReject(awaitedTransaction);
  // }

  throw Error("transaction failed");
};

export const generateApproveCall: GenerateApproveCall = ({
  tokenAddress,
  spender,
  amount,
}) => {
  return {
    entrypoint: "approve",
    contractAddress: tokenAddress,
    calldata: [spender, amount.toString(), "0"],
  };
};
