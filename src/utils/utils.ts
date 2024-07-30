import { BigNumberish } from "starknet";

import {
  ETH_ADDRESS,
  ETH_DIGITS,
  USDC_ADDRESS,
  USDC_DIGITS,
} from "../constants/amm";
import { TESTNET_CHAINID } from "../constants/starknet";
import { OptionSide, OptionType } from "../types/options";

export const isNonEmptyArray = (v: unknown): v is Array<any> =>
  !!(v && Array.isArray(v) && v.length > 0);

export const handleBlockChainResponse = (v: unknown): bigint | null =>
  v && isNonEmptyArray(v) ? v[0] : null;

export const weiToEth = (bn: bigint, decimalPlaces: number): string => {
  const v: string = Number(bn)
    .toLocaleString("fullwide", { useGrouping: false })
    .padStart(19, "0");
  const index = v.length - 18;
  const [lead, tail] = [v.slice(0, index), v.slice(index)];
  const dec = tail.substring(0, decimalPlaces);

  if (Number(lead) === 0 && Number(dec) === 0) {
    return "0";
  }

  if (Number(dec) === 0) {
    return lead;
  }

  return `${lead}.${dec}`;
};

export const timestampToReadableDate = (ts: number): string =>
  new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZoneName: "short",
  }).format(ts);

export const timestampToShortTimeDate = (ts: number): string =>
  new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(ts);

export const timestampToPriceGuardDate = (ts: number): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(ts);

export const timestampToDateAndTime = (ts: number): [string, string] => {
  const date = new Intl.DateTimeFormat("default", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(ts);
  const time = new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(ts);

  return [date, time];
};

export const timestampToRichDate = (ts: number): string => {
  const d = new Date(ts);
  return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
};

export const hashToReadable = (v: string): string =>
  v.slice(0, 4) + "..." + v.slice(v.length - 4);

export const debounce = (cb: (...args: any[]) => void, delay: number = 750) => {
  let timeout: number;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

export const isCall = (type: OptionType): boolean => type === OptionType.Call;

export const isLong = (side: OptionSide): boolean => side === OptionSide.Long;

export const currencyAddresByType = (type: OptionType) =>
  isCall(type) ? ETH_ADDRESS : USDC_ADDRESS;

export const digitsByType = (type: OptionType) =>
  isCall(type) ? ETH_DIGITS : USDC_DIGITS;

export const toHex = (v: BigNumberish) => "0x" + BigInt(v).toString(16);

export const hexToBN = (v: string): bigint => BigInt(v);

export const assert = (condition: boolean, message?: string): void => {
  if (!condition) {
    throw new Error("Assertion failed " + message);
  }
};

type StarkscanProps = {
  chainId?: string;
  txHash?: string;
  contractHash?: string;
};

export const getStarkscanUrl = ({
  chainId,
  txHash,
  contractHash,
}: StarkscanProps): string => {
  const baseUrl = `https://${
    chainId === TESTNET_CHAINID ? "testnet." : ""
  }starkscan.co`;

  if (txHash) {
    return `${baseUrl}/tx/${txHash}`;
  }

  if (contractHash) {
    return `${baseUrl}/contract/${contractHash}`;
  }

  // fallback
  return "";
};

export const addressElision = (address: string, n: number = 5): string => {
  const standardised = standardiseAddress(address);

  if (standardised.length < 2 * n) {
    // too short for elision
    return standardised;
  }

  const start = standardised.substring(0, n);
  const end = standardised.substring(standardised.length - n);

  return `${start}...${end}`;
};

export const isDev =
  new URL(window.location.href).hostname !== "app.carmine.finance";

export const stripZerosFromAddress = (address: string): string => {
  const withoutPrefix = address.replace(/^0x0*/g, "");
  return "0x" + withoutPrefix;
};

export const standardiseAddress = (address: string): string =>
  "0x" + BigInt(address).toString(16);

export const uniquePrimitiveValues = (
  value: any,
  index: number,
  array: any[]
) => array.indexOf(value) === index;

/**
 * Compares if two values represent the same number.
 * Great for comparing addresses (0x0123 === 0x123).
 */
export const isEqual = (
  a: string | number | bigint,
  b: string | number | bigint
): boolean => BigInt(a) === BigInt(b);

export const isPromiseFulfilled = <T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> => {
  return result.status === "fulfilled";
};

export const maxDecimals = (num: number, maxDecimalPlaces: number): string => {
  if (Math.floor(num) !== num) {
    return num.toFixed(maxDecimalPlaces).replace(/\.?0+$/, "");
  }

  return num.toString();
};
