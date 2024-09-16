import { BigNumberish } from "starknet";
import { impLossContract } from "../../constants/starknet";
import { debug } from "../../utils/debugger";

type ILResponse = {
  0: bigint;
  1: bigint;
};

export type ILPrice = {
  basePrice: bigint;
  quotePrice: bigint;
};

export const getPrice = async (
  sizeRaw: BigNumberish,
  baseAddress: string,
  quoteAddress: string,
  expiry: number,
  signal: AbortSignal
): Promise<ILPrice | undefined> => {
  const res = (await impLossContract
    .call("price_hedge", [sizeRaw, quoteAddress, baseAddress, expiry])
    .catch((e: Error) => {
      debug("Failed getting IMP LOSS price", e.message);
      throw Error(e.message);
    })) as ILResponse;

  if (signal.aborted) {
    return;
  }

  return {
    basePrice: res[0],
    quotePrice: res[1],
  };
};
