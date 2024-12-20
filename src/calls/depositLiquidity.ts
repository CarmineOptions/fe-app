import { debug } from "../utils/debugger";
import { Call } from "starknet";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { Pool } from "../classes/Pool";
import { RequestResult } from "@starknet-react/core";

export const depositLiquidity = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  size: string,
  sizeNum: number,
  pool: Pool,
  ok: () => void,
  nok: () => void
): Promise<void> => {
  const approveCalldata = pool.underlying.approveCalldata(size);

  const depositLiquidityCalldata = pool.depositLiquidityCalldata(size);

  debug("Depositing liquidity with calldata:", [
    approveCalldata,
    depositLiquidityCalldata,
  ]);

  pool.sendStakeBeginCheckoutEvent(sizeNum);

  const res = await sendAsync([
    approveCalldata,
    depositLiquidityCalldata,
  ]).catch((e: Error) => {
    debug('"Stake capital" user rejected or failed', e);
  });

  pool.sendStakePurchaseEvent(sizeNum);

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;
    addTx(hash, pool.poolId, TransactionAction.Stake);
    afterTransaction(
      res.transaction_hash,
      () => {
        // everything done - OK callback
        ok();
        markTxAsDone(hash);
      },
      () => {
        debug("Tx failed");
        nok();
        markTxAsFailed(hash);
      }
    );
  } else {
    // transaction was not successfully created (no txhash)
    // NotOK callback
    nok();
  }
};
