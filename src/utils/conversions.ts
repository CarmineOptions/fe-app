import { OptionSide, OptionType } from "../types/options";
import { ETH_DIGITS } from "../constants/amm";
import { BigNumberish, Uint256, uint256 } from "starknet";
import { longInteger } from "./computations";

export const getBaseAmountWei = (amount: number) =>
  longInteger(amount, 18).toString(16);

export const getBaseAmountUsd = (amount: number) =>
  longInteger(amount, 6).toString(16);

export const convertSizeToInt = (size: number): string =>
  longInteger(size, ETH_DIGITS).toString(10);

export const convertSizeToUint256 = (size: number): Uint256 => {
  return uint256.bnToUint256(longInteger(size, ETH_DIGITS));
};

export const bnToOptionSide = (n: BigNumberish): OptionSide =>
  BigInt(n) === 1n ? OptionSide.Short : OptionSide.Long;

export const bnToOptionType = (n: BigNumberish): OptionType =>
  BigInt(n) === 1n ? OptionType.Put : OptionType.Call;
