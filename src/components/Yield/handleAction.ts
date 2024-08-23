import { AccountInterface } from "starknet";
import { Pool } from "../../classes/Pool";
import { invalidateStake } from "../../queries/client";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { longInteger, shortInteger } from "../../utils/computations";
import { debug } from "../../utils/debugger";
import { decimalToInt } from "../../utils/units";
import { balanceOf } from "../../calls/balanceOf";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";
import { TransactionState, TxTracking } from "../../types/network";

export const handleDeposit = async (
  account: AccountInterface,
  amount: number,
  pool: Pool,
  setTxState: TxTracking,
  done: (tx: string) => void
) => {
  if (!amount) {
    showToast("Cannot stake 0 amount", ToastType.Warn);
    return;
  }
  debug(`Staking ${amount} into ${pool.typeAsText} pool`);
  setTxState(TransactionState.Processing);

  const balance = await balanceOf(account.address, pool.underlying.address);

  const bnAmount = longInteger(amount, pool.digits);

  if (balance < bnAmount) {
    const [has, needs] = [
      shortInteger(balance.toString(10), pool.digits),
      amount,
    ];
    showToast(
      `Trying to stake ${pool.symbol} ${needs.toFixed(4)}, but you only have ${
        pool.symbol
      }${has.toFixed(4)}`,
      ToastType.Warn
    );
    setTxState(TransactionState.Fail);
    return;
  }

  const size = decimalToInt(amount, pool.digits);

  const approveCalldata = pool.underlying.approveCalldata(size);

  const depositLiquidityCalldata = pool.depositLiquidityCalldata(size);

  debug("Depositing liquidity with calldata:", [
    approveCalldata,
    depositLiquidityCalldata,
  ]);

  pool.sendStakeBeginCheckoutEvent(amount);

  const res = await account
    .execute([approveCalldata, depositLiquidityCalldata])
    .catch((e: Error) => {
      debug('"Stake capital" user rejected or failed');
      setTxState(TransactionState.Fail);
    });

  pool.sendStakePurchaseEvent(amount);

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
    }
  );
};
