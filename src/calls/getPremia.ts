import { AMM_METHODS } from "../constants/amm";
import { AMMContract } from "../utils/blockchain";
import { debug } from "../utils/debugger";
import { Option } from "../classes/Option";
import { BigNumberish, uint256 } from "starknet";
import { longInteger } from "../utils/computations";

const method = AMM_METHODS.GET_TOTAL_PREMIA;

export const getPremia = async (
  option: Option,
  size: number,
  isClosing: boolean
): Promise<bigint> => {
  const convertedSize = uint256.bnToUint256(
    longInteger(size, option.baseToken.decimals)
  );

  const calldata = [option.struct, convertedSize, isClosing];

  debug("GET_TOTAL_PREMIA", calldata);

  const res = await AMMContract.call(
    method,
    calldata,
    { parseResponse: false } // currently starknet-js cannot parse tuple, gotta format manually
  ).catch((e: Error) => {
    debug(`Failed while calling ${method}`, e.message);
    throw Error(e.message);
  });

  if (res && (res as string[]).length && (res as string[]).length === 4) {
    return BigInt((res as string[])[2]);
  }

  return BigInt(res as BigNumberish);
};
