import { Call } from "starknet";

import { depositLiquidity } from "../../calls/depositLiquidity";
import { Pool } from "../../classes/Pool";
import { invalidateStake } from "../../queries/client";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { longInteger, shortInteger } from "../../utils/computations";
import { debug } from "../../utils/debugger";
import { decimalToInt } from "../../utils/units";
import { balanceOf } from "./../../calls/balanceOf";
import { RequestResult } from "@starknet-react/core";

export const handleStake = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  address: string | undefined,
  amount: number,
  pool: Pool,
  setLoading: (v: boolean) => void
) => {
  if (!address) {
    showToast("Could not read address", ToastType.Warn);
    return;
  }
  if (!amount) {
    showToast("Cannot stake 0 amount", ToastType.Warn);
    return;
  }
  debug(`Staking ${amount} into ${pool.typeAsText} pool`);
  setLoading(true);

  const balance = await balanceOf(address, pool.underlying.address);

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

  depositLiquidity(sendAsync, size, amount, pool, ok, nok);
};
