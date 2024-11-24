import {
  Decimal,
  IntBN,
  Math64BN,
  OptionSideBN,
  Uint256BN,
  cubit,
} from "./units";
import { ParsedPool, RawPool } from "./pool";
import { BigNumberish } from "starknet";

export enum OptionType {
  Call = "0x0",
  Put = "0x1",
}

export enum OptionSide {
  Long = "0x0",
  Short = "0x1",
}

export interface OptionStruct {
  base_token_address: BigNumberish;
  maturity: BigNumberish;
  option_side: BigNumberish;
  option_type: BigNumberish;
  quote_token_address: BigNumberish;
  strike_price: cubit;
}

export interface RawOption extends RawOptionBase {
  token_address?: bigint;
  balance?: bigint;
  premia?: bigint;
  position_size?: bigint;
  value_of_position?: bigint;
}

export interface RawOptionBase extends RawPool {
  option_side: OptionSideBN;
  maturity: IntBN;
  strike_price: Math64BN;
}

export interface ParsedOptionBase extends ParsedPool {
  optionSide: OptionSide;
  maturity: Decimal;
  strikePrice: number;
}

export interface RawOptionWithPosition extends RawOptionBase {
  position_size: Uint256BN;
  value_of_position: Math64BN;
}

export interface ParsedOptionWithPosition extends ParsedOptionBase {
  positionSize: Decimal;
  positionValue: Decimal;
}

export interface RawOptionWithPremia extends RawOptionBase {
  premia: Math64BN;
}

export interface ParsedOptionWithPremia extends ParsedOptionBase {
  premiaBase: string;
  premiaDecimal: Decimal;
}

export type FinancialData = {
  premiaUsd: number;
  premia: number;
  sizeOnePremiaUsd: number;
  sizeOnePremia: number;
};
