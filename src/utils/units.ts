import { Decimal, Int, Math64 } from "../types/units";
import { longInteger, shortInteger } from "./computations";
import { BASE_MATH_64 } from "../constants/amm";
import { BigNumberish, Uint256, uint256 } from "starknet";

const PRECISSION_DIGITS = 20;
const PRECISSION_BASE_VALUE = BigInt(10) ** BigInt(PRECISSION_DIGITS);

export const decimalToInt = (n: Decimal, digits: number): Int =>
  longInteger(n, digits).toString(10);

export const intToDecimal = (n: Int, digits: number): Decimal =>
  shortInteger(n, digits);

export const math64toDecimal = (
  n: BigNumberish,
  base = BASE_MATH_64
): number => {
  const num = BigInt(n);
  const integerPart = num / base;
  const remainder = num % base;
  const fractionalPart = Number(remainder) / Number(base);
  return Number(integerPart) + fractionalPart;
};

export const decimalToMath64 = (n: Decimal): Math64 => {
  const longInt = longInteger(n, PRECISSION_DIGITS);
  const mul = longInt * BASE_MATH_64;

  const div = mul / PRECISSION_BASE_VALUE;
  return div.toString(10);
};

export const math64ToInt = (n: BigNumberish, digits: number): Int =>
  ((BigInt(n) * 10n ** BigInt(digits)) / BASE_MATH_64).toString(10);

export const intToMath64 = (n: BigNumberish, digits: number): Math64 =>
  ((BigInt(n) * BASE_MATH_64) / 10n ** BigInt(digits)).toString(10);

export const decimalToUint256 = (n: Decimal, digits: number): Uint256 =>
  uint256.bnToUint256(longInteger(n, digits));

export const uint256toDecimal = (n: bigint, digits: number): Decimal =>
  shortInteger(n.toString(10), digits);
