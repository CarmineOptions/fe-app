import { Call } from "starknet";
import { debug } from "../../utils/debugger";
import { invalidateStake } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import {
  addTx,
  markTxAsDone,
  openNotEnoughUnlockedCapitalDialog,
} from "../../redux/actions";
import { TransactionAction } from "../../redux/reducers/transactions";
import { UserPoolInfo } from "../../classes/Pool";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";

const calculateTokens = (
  pool: UserPoolInfo,
  amount: number
): [bigint, bigint] => {
  // amount * digits / value = percentage to withdraw
  // percentage * size = tokens to withdraw
  const NUM_PRECISSION = 1_000_000;

  const percentageWithPrecission =
    (BigInt(amount * NUM_PRECISSION) * 10n ** BigInt(pool.digits)) /
    pool.valueBase;

  const tokens =
    (percentageWithPrecission * pool.sizeBase) / BigInt(NUM_PRECISSION);

  const value =
    (percentageWithPrecission * pool.valueBase) / BigInt(NUM_PRECISSION);

  return [tokens, value];
};

export const withdrawCall = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  setProcessing: (b: boolean) => void,
  pool: UserPoolInfo,
  amount: number | "all"
) => {
  setProcessing(true);

  const unlocked = await pool.getUnlocked();

  const [tokens, value] =
    amount === "all"
      ? [pool.sizeBase, pool.valueBase]
      : calculateTokens(pool, amount);

  // if withdrawing more than unlocked
  // show dialog and stop transaction
  if (value > unlocked) {
    debug("Withdrawing more than unlocked", { value, unlocked });
    openNotEnoughUnlockedCapitalDialog();
    setProcessing(false);
    return;
  }

  const withdraw = pool.withdrawLiquidityCalldata(tokens);

  debug("Withdraw call", withdraw);

  const res = await sendAsync([withdraw]).catch((e) => {
    debug("Withdraw rejected by user or failed\n", e.message);
    setProcessing(false);
  });

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, pool.poolId, TransactionAction.Withdraw);
    afterTransaction(res.transaction_hash, () => {
      invalidateStake();
      setProcessing(false);
      toast.success("Successfully withdrew capital");
      markTxAsDone(hash);
    });
  }
};
