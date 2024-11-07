import { Call } from "starknet";

import { depositLiquidity } from "../../calls/depositLiquidity";
import { Pool } from "../../classes/Pool";
import { invalidateStake } from "../../queries/client";
import { longInteger, shortInteger } from "../../utils/computations";
import { debug } from "../../utils/debugger";
import { decimalToInt } from "../../utils/units";
import { balanceOf } from "./../../calls/balanceOf";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";

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
    toast.error("Could not read address");
    return;
  }
  if (!amount) {
    toast("Cannot stake 0 amount");
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
    toast.error(
      `Trying to stake ${pool.symbol} ${needs.toFixed(4)}, but you only have ${
        pool.symbol
      }${has.toFixed(4)}`
    );
    setLoading(false);
    return;
  }

  const size = decimalToInt(amount, pool.digits);

  const ok = () => {
    invalidateStake();
    setLoading(false);
    toast.success("Successfully staked capital");
  };

  const nok = () => {
    setLoading(false);
  };

  depositLiquidity(sendAsync, size, amount, pool, ok, nok);
};
