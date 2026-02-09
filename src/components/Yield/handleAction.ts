import { Call } from "starknet";
import { invalidateStake } from "../../queries/client";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  openNotEnoughUnlockedCapitalDialog,
} from "../../redux/actions";
import { longInteger, shortInteger } from "../../utils/computations";
import { debug } from "../../utils/debugger";
import { balanceOf } from "../../calls/balanceOf";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";
import { TransactionState, TxTracking } from "../../types/network";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";
import {
  LiquidityPool,
  lpTokensToHumanReadable,
  UserPoolInfo,
} from "@carmine-options/sdk/core";

export const handleDeposit = async (
  sendAsync: (
    args?: Call[],
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  address: string | undefined,
  amount: number,
  pool: LiquidityPool,
  setTxState: TxTracking,
  done: (tx: string) => void,
) => {
  if (!address) {
    toast.error("Could not read address");
    return;
  }
  if (!amount) {
    toast("Cannot stake 0 amount");
    return;
  }
  debug(`Staking ${amount} into ${pool.typeAsText} pool`);
  setTxState(TransactionState.Processing);

  const balance = await balanceOf(address, pool.underlying.address);

  const bnAmount = longInteger(amount, pool.underlying.decimals);

  if (balance < bnAmount) {
    const [has, needs] = [
      shortInteger(balance.toString(10), pool.underlying.decimals),
      amount,
    ];
    toast.error(
      `Trying to stake ${pool.underlying.symbol} ${needs.toFixed(
        4,
      )}, but you only have ${pool.underlying.symbol}${has.toFixed(4)}`,
    );
    setTxState(TransactionState.Fail);
    return;
  }

  const call = pool.deposit(amount);

  const res = await sendAsync(call).catch((e: Error) => {
    debug('"Stake capital" user rejected or failed', e);
    setTxState(TransactionState.Fail);
  });

  if (!res) {
    setTxState(TransactionState.Fail);
    return;
  }

  const hash = res.transaction_hash;
  addTx(hash, pool.poolId, TransactionAction.Stake);
  afterTransaction(
    res.transaction_hash,
    () => {
      // everything done - OK callback
      invalidateStake();
      setTxState(TransactionState.Success);
      done(hash);
      markTxAsDone(hash);
    },
    () => {
      debug("Tx failed");
      setTxState(TransactionState.Fail);
      markTxAsFailed(hash);
    },
  );
};

const calculateTokens = (
  pool: UserPoolInfo,
  amount: number,
): [bigint, bigint] => {
  // amount * digits / value = percentage to withdraw
  // percentage * size = tokens to withdraw
  const NUM_PRECISSION = 1_000_000;
  const BI_NUM_PRECISSION = BigInt(NUM_PRECISSION);

  const poolValueRaw = pool.valueRaw as unknown as bigint;
  const poolSizeRaw = pool.sizeRaw as unknown as bigint;

  const percentageWithPrecission =
    (BigInt(Math.round(amount * NUM_PRECISSION)) *
      10n ** BigInt(pool.underlying.decimals)) /
    poolValueRaw;

  const decimalAlign = 18 - pool.underlying.decimals;

  const tokensPreAlign =
    (percentageWithPrecission * poolSizeRaw) / BI_NUM_PRECISSION;
  const tokens =
    decimalAlign < 0
      ? tokensPreAlign
      : tokensPreAlign * 10n ** BigInt(decimalAlign);

  const value = (percentageWithPrecission * poolValueRaw) / BI_NUM_PRECISSION;

  console.log({ pool, amount, tokens, value });

  return [tokens, value];
};

export const handleWithdraw = async (
  sendAsync: (
    args?: Call[],
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  amount: number,
  pool: UserPoolInfo,
  setTxState: TxTracking,
) => {
  if (!amount) {
    toast("Cannot withdraw 0");
    return;
  }

  setTxState(TransactionState.Processing);

  const unlocked = pool.unlockedRaw as unknown as bigint;

  const [tokens, value] = calculateTokens(pool, amount);

  console.log("HANDLE WITHDRAWL", {
    pool,
    amount,
    tokens,
    value,
    unlocked,
    isEnoughUnlocked: value < unlocked,
  });

  // if withdrawing more than unlocked
  // show dialog and stop transaction
  if (value > unlocked) {
    debug("Withdrawing more than unlocked", { value, unlocked });
    openNotEnoughUnlockedCapitalDialog();
    setTxState(TransactionState.Fail);
    return;
  }

  const withdraw = pool.withdraw(lpTokensToHumanReadable(tokens));

  debug("Withdraw call", withdraw);

  const res = await sendAsync([withdraw]).catch((e) => {
    debug("Withdraw rejected by user or failed\n", e.message);
    setTxState(TransactionState.Fail);
  });

  if (!res) {
    return;
  }

  const hash = res.transaction_hash;

  addTx(hash, pool.poolId, TransactionAction.Withdraw);
  afterTransaction(
    res.transaction_hash,
    () => {
      invalidateStake();
      setTxState(TransactionState.Success);
      toast.success("Successfully withdrew capital");
      markTxAsDone(hash);
    },
    () => {
      setTxState(TransactionState.Fail);
      toast("Capital withdrawl failed");
      markTxAsFailed(hash);
    },
  );
};
