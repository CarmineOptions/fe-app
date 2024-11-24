import { BigNumberish } from "starknet";

export type Uint256LeadingNumber = string;
export type Uint256TailZero = string;
export type Int = string;
export type Math64 = string;
export type Address = string;
export type Hex = string;
export type Decimal = number;

export type IntBN = bigint;
export type Math64BN = bigint;
export type Uint256BN = bigint;
export type OptionSideBN = bigint;
export type OptionTypeBN = bigint;
export type AddressBN = bigint;

export const Cubit = (n: BigNumberish): cubit => {
  const bi = BigInt(n);
  return bi > 0n ? { mag: bi, sign: false } : { mag: bi, sign: true };
};

export const isCubit = (n: unknown): n is cubit => {
  if (n && Object.keys(n).includes("mag") && Object.keys(n).includes("sign")) {
    if (
      typeof (n as cubit).mag === "bigint" &&
      typeof (n as cubit).sign === "boolean"
    ) {
      return true;
    }
  }
  return false;
};

export type cubit = { mag: bigint; sign: boolean };
