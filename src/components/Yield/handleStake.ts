import { AccountInterface } from "starknet";

import { depositLiquidity } from "../../calls/depositLiquidity";
import { Pool } from "../../classes/Pool";
import { invalidateStake } from "../../queries/client";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { longInteger, shortInteger } from "../../utils/computations";
import { debug } from "../../utils/debugger";
import { decimalToInt } from "../../utils/units";
import { balanceOf } from "./../../calls/balanceOf";

export const handleStake = async (
  account: AccountInterface,
  amount: number,
  pool: Pool,
  setLoading: (v: boolean) => void
) => {
  if (!amount) {
    showToast("Cannot stake 0 amount", ToastType.Warn);
    return;
  }
  debug(`Staking ${amount} into ${pool.typeAsText} pool`);
  setLoading(true);

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
    setLoading(false);
    return;
  }

  const size = decimalToInt(amount, pool.digits);

  const ok = () => {
    invalidateStake();
    setLoading(false);
    showToast("Successfully staked capital", ToastType.Success);
  };

  const nok = () => {
    setLoading(false);
  };

  depositLiquidity(account, size, amount, pool, ok, nok);
};
