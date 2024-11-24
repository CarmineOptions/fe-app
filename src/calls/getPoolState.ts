import { apiUrl } from "../api";
import { debug } from "../utils/debugger";

type RawPoolState = {
  unlocked_cap: string;
  locked_cap: string;
  lp_balance: string;
  pool_position: string;
  lp_token_value: string;
  block_number: number;
  lp_address: string;
  timestamp: number;
};

type PoolState = {
  unlocked_cap: bigint;
  locked_cap: bigint;
  lp_balance: bigint;
  pool_position: bigint;
  lp_token_value: bigint;
  block_number: number;
  lp_address: string;
  timestamp: number;
};

const parsePoolState = (obj: RawPoolState): PoolState => {
  const parsed: PoolState = {
    unlocked_cap: BigInt(obj.unlocked_cap),
    locked_cap: BigInt(obj.locked_cap),
    lp_balance: BigInt(obj.lp_balance),
    pool_position: BigInt(obj.pool_position),
    lp_token_value: BigInt(obj.lp_token_value),
    block_number: obj.block_number,
    lp_address: obj.lp_address,
    timestamp: obj.timestamp,
  };
  return parsed;
};

export const getPoolState = async (pool: string): Promise<PoolState> => {
  const state = await fetch(apiUrl(`${pool}/state`))
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success") {
        const state = result.data;
        debug(state);
        return parsePoolState(state);
      }
    })
    .catch((e) => {
      debug(e);
    });
  if (state) {
    return state;
  }
  throw Error("Failed fetching pool state");
};
