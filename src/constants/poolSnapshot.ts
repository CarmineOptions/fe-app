import {
  BTC_USDC_CALL_ADDRESS,
  BTC_USDC_PUT_ADDRESS,
  EKUBO_USDC_CALL_ADDRESS,
  EKUBO_USDC_PUT_ADDRESS,
  ETH_STRK_CALL_ADDRESS,
  ETH_STRK_PUT_ADDRESS,
  ETH_USDC_CALL_ADDRESS,
  ETH_USDC_PUT_ADDRESS,
  STRK_USDC_CALL_ADDRESS,
  STRK_USDC_PUT_ADDRESS,
} from "@carmine-options/sdk/core";

/**
 * On-chain snapshot of every liquidity pool, taken at block 14148547
 * (2026-08-31). No new options are issued, so these numbers no longer move
 * and are hardcoded to keep the app off the Carmine API and off a
 * rate-limited public RPC node.
 *
 * All amounts are human readable and denominated in the pool's underlying
 * token. `lpTokenValue` is how much underlying one LP token is worth
 * (tvl / lpTokenSupply, cross-checked against
 * `get_underlying_for_lptokens`).
 */
export type PoolSnapshot = {
  unlocked: number;
  locked: number;
  position: number;
  tvl: number;
  lpTokenSupply: number;
  lpTokenValue: number;
};

export const POOL_SNAPSHOT_BLOCK = 14148547;
export const POOL_SNAPSHOT_DATE = "31 Aug 2026";

export const poolSnapshots: Record<string, PoolSnapshot> = {
  [ETH_USDC_CALL_ADDRESS]: {
    unlocked: 4.711602739967358,
    locked: 0,
    position: 0,
    tvl: 4.711602739967358,
    lpTokenSupply: 4.303635730183852,
    lpTokenValue: 1.094795897088176,
  },
  [ETH_USDC_PUT_ADDRESS]: {
    unlocked: 3628.938453,
    locked: 0.000054,
    position: 0,
    tvl: 3628.938453,
    lpTokenSupply: 3531.889861,
    lpTokenValue: 1.02747780814788,
  },
  [BTC_USDC_CALL_ADDRESS]: {
    unlocked: 0.00108599,
    locked: 0.00000004,
    position: 0,
    tvl: 0.00108599,
    lpTokenSupply: 0.00148659,
    lpTokenValue: 0.7305242198588716,
  },
  [BTC_USDC_PUT_ADDRESS]: {
    unlocked: 46.658395,
    locked: 0.000004,
    position: 0,
    tvl: 46.658395,
    lpTokenSupply: 41.393887,
    lpTokenValue: 1.1271808081227066,
  },
  [STRK_USDC_CALL_ADDRESS]: {
    unlocked: 30124.47409654737,
    locked: 0,
    position: 0,
    tvl: 30124.47409654737,
    lpTokenSupply: 22334.005962010942,
    lpTokenValue: 1.348816425847993,
  },
  [STRK_USDC_PUT_ADDRESS]: {
    unlocked: 4262.695455,
    locked: 0.61637,
    position: 2.1059909984164804,
    tvl: 4264.801445998417,
    lpTokenSupply: 6657.130558,
    lpTokenValue: 0.640636593926091,
  },
  [EKUBO_USDC_CALL_ADDRESS]: {
    unlocked: 2.9077759739592253,
    locked: 0,
    position: 0,
    tvl: 2.9077759739592253,
    lpTokenSupply: 3.1381990081211817,
    lpTokenValue: 0.9265747540020067,
  },
  [EKUBO_USDC_PUT_ADDRESS]: {
    unlocked: 3.32605,
    locked: 1.999991,
    position: 1.6246483184704088,
    tvl: 4.950698318470408,
    lpTokenSupply: 5.1051,
    lpTokenValue: 0.9697554050793145,
  },
  [ETH_STRK_CALL_ADDRESS]: {
    unlocked: 0.5081141290466102,
    locked: 0,
    position: 0,
    tvl: 0.5081141290466102,
    lpTokenSupply: 0.5183399561839548,
    lpTokenValue: 0.9802719682028227,
  },
  [ETH_STRK_PUT_ADDRESS]: {
    unlocked: 23213.809368086215,
    locked: 0,
    position: 0,
    tvl: 23213.809368086215,
    lpTokenSupply: 22623.991230182546,
    lpTokenValue: 1.0260704723540024,
  },
};

export const getPoolSnapshot = (lpAddress: string): PoolSnapshot | undefined =>
  poolSnapshots[lpAddress];
