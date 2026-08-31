/**
 * Reads every liquidity pool straight off the AMM and prints the snapshot that
 * `src/constants/poolSnapshot.ts` holds. The app no longer fetches this data at
 * runtime (Carmine API is gone, public RPC nodes rate limit us), so re-run this
 * once the two pools that still hold unsettled options have settled, and paste
 * the numbers in.
 *
 *   node scripts/snapshot-pools.mjs                 # progress on stderr, JSON on stdout
 *   node scripts/snapshot-pools.mjs > pools.json
 *   RPC=https://my-node node scripts/snapshot-pools.mjs
 *
 * Calls go through `provider.callContract` with raw calldata so the script does
 * not depend on an ABI. Note that `get_all_poolinfo` and `get_user_pool_infos`
 * both revert with "Out of gas" on a plain starknet_call, so the pools are
 * walked one by one.
 */
import { RpcProvider } from "starknet";
import { allLiquidityPools } from "@carmine-options/sdk/core";
import config from "../src/constants/config.json" with { type: "json" };

const nodeUrl = process.env.RPC ?? config.RPC_URL;
const provider = new RpcProvider({ nodeUrl });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const call = async (contractAddress, entrypoint, calldata = []) => {
  const res = await provider.callContract({
    contractAddress,
    entrypoint,
    calldata,
  });
  await sleep(250);
  return res.map((felt) => BigInt(felt));
};

// [low, high] -> bigint
const u256 = ([low, high]) => low + (high << 128n);
// cubit fixed point [mag, sign] -> number
const fixed = ([mag, sign]) => (Number(mag) / 2 ** 64) * (sign ? -1 : 1);

const block = await provider.getBlockLatestAccepted();
const pools = [];

for (const pool of allLiquidityPools) {
  const lp = pool.lpAddress;
  const dec = pool.underlying.decimals;
  // LP tokens report 18 decimals but are minted in the underlying's scale
  const scale = 10 ** dec;

  const unlocked = Number(u256(await call(config.AMM_ADDRESS, "get_unlocked_capital", [lp]))) / scale;
  const locked = Number(u256(await call(config.AMM_ADDRESS, "get_pool_locked_capital", [lp]))) / scale;
  const position = fixed(await call(config.AMM_ADDRESS, "get_value_of_pool_position", [lp]));
  const lpTokenSupply = Number(u256(await call(lp, "totalSupply"))) / scale;
  // cross-check: underlying paid out for exactly one LP token
  const onChainValue =
    Number(
      u256(
        await call(config.AMM_ADDRESS, "get_underlying_for_lptokens", [
          lp,
          `0x${BigInt(scale).toString(16)}`,
          "0x0",
        ])
      )
    ) / scale;

  const tvl = unlocked + position;
  const lpTokenValue = lpTokenSupply === 0 ? 0 : tvl / lpTokenSupply;
  // leftover dust is fine; a live position (or non-trivial locked capital)
  // means options are still open and these numbers will move on settlement
  const settled = position === 0 && locked < 0.001;

  pools.push({
    poolId: pool.poolId,
    lpAddress: lp,
    symbol: pool.underlying.symbol,
    decimals: dec,
    unlocked,
    locked,
    position,
    tvl,
    lpTokenSupply,
    lpTokenValue,
    lpTokenValueOnChain: onChainValue,
    settled,
  });

  console.error(
    `${pool.poolId.padEnd(16)} tvl=${tvl} ${pool.underlying.symbol}  ` +
      `supply=${lpTokenSupply}  lpValue=${lpTokenValue} (chain ${onChainValue})` +
      (settled ? "" : "  <-- NOT SETTLED")
  );
}

console.log(
  JSON.stringify(
    { blockNumber: block.block_number, fetchedAt: new Date().toISOString(), nodeUrl, pools },
    null,
    2
  )
);
