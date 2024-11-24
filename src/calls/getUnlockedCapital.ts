import { AMM_METHODS } from "../constants/amm";
import { AMMContract } from "../utils/blockchain";
import { debug } from "../utils/debugger";

const method = AMM_METHODS.GET_UNLOCKED_CAPITAL;

export const getUnlockedCapital = async (
  lpoolAddress: string
): Promise<bigint> => {
  const res = await AMMContract.call(method, [lpoolAddress]).catch(
    (e: Error) => {
      debug(`Failed while calling ${method}`, e.message);
      throw Error(e.message);
    }
  );

  return res as bigint;
};
