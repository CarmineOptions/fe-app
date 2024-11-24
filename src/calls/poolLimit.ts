import {
  AMM_METHODS,
  ETH_ADDRESS,
  ETH_DIGITS,
  ETH_USDC_CALL_ADDRESS,
  ETH_USDC_PUT_ADDRESS,
  USDC_ADDRESS,
  USDC_DIGITS,
} from "../constants/amm";
import { AMMContract } from "../utils/blockchain";
import { shortInteger } from "../utils/computations";
import { debug } from "../utils/debugger";
import { Result } from "starknet";

export const lpoolBalance = async (lpoolAddress: string): Promise<bigint> => {
  const balance: Result = await AMMContract.call(AMM_METHODS.GET_LOOP_BALANCE, [
    lpoolAddress,
  ]).catch((e: Error) => {
    debug(`Failed while calling ${AMM_METHODS.GET_LOOP_BALANCE}`, e.message);
    throw Error(e.message);
  });

  if (typeof balance === "bigint") {
    return balance;
  }

  throw Error(`POOL BALANCE ${balance}`);
};

export const lpoolLimit = async (tokenAddress: string): Promise<bigint> => {
  const limit = await AMMContract.call(AMM_METHODS.GET_MAX_LPOOL_BALANCE, [
    tokenAddress,
  ]).catch((e: Error) => {
    debug(
      `Failed while calling ${AMM_METHODS.GET_MAX_LPOOL_BALANCE}`,
      e.message
    );
    throw Error(e.message);
  });

  if (typeof limit === "bigint") {
    return limit;
  }

  throw Error(`POOL LIMIT ${limit}`);
};

type PoolLimit = {
  base: bigint;
  converted: number;
  symbol: string;
};

export const poolLimit = async (lpoolAddress: string): Promise<PoolLimit> => {
  // TODO: abstract addresses away
  if (
    lpoolAddress !== ETH_USDC_CALL_ADDRESS &&
    lpoolAddress !== ETH_USDC_PUT_ADDRESS
  ) {
    // weird to address
    debug("wrong to address", lpoolAddress);
  }
  const [tokenAddress, decimals, symbol] =
    lpoolAddress === ETH_USDC_CALL_ADDRESS
      ? [ETH_ADDRESS, ETH_DIGITS, "ETH"]
      : [USDC_ADDRESS, USDC_DIGITS, "USDC"];

  const [balance, limit] = await Promise.all([
    lpoolBalance(lpoolAddress),
    lpoolLimit(tokenAddress),
  ]).catch((e) => {
    debug("Failed getting poolLimit", e);
    throw Error(e);
  });

  const _stakable = limit - balance;
  const stakable = _stakable > 0n ? _stakable : 0n;
  const converted = shortInteger(stakable.toString(10), decimals);

  debug(
    `balance: ${balance.toString(10)}\nlimit:  ${limit.toString(
      10
    )}\nstakable: ${stakable}`
  );

  return {
    base: stakable,
    converted,
    symbol,
  };
};
