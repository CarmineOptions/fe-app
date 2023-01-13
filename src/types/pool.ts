import BN from "bn.js";
import { OptionType } from "./options";
import {
  Address,
  AddressBN,
  Decimal,
  Int,
  Math64x61,
  Math64x61BN,
} from "./units";
import { Uint256 } from "starknet/dist/utils/uint256";

export interface RawPool {
  quote_token_address: AddressBN;
  base_token_address: AddressBN;
  option_type: BN;
}

export interface ParsedPool {
  quoteTokenAddress: Address;
  baseTokenAddress: Address;
  optionType: OptionType;
}

export interface Pool {
  raw: RawPool;
  parsed: ParsedPool;
}

export interface RawPoolInfo {
  pool: RawPool;
  lptoken_address: AddressBN;
  staked_capital: Uint256; // lpool_balance
  unlocked_capital: Uint256;
  value_of_pool_position: Math64x61BN;
}

export interface ParsedPoolInfo {
  pool: Pool;
  lptokenAddress: Address;
  stakedCapital: Int; // lpool_balance
  unlockedCapital: Int;
  valueOfPoolPosition: Math64x61;
}

export interface PoolInfo {
  raw: RawPoolInfo;
  parsed: ParsedPoolInfo;
}

export interface RawUserPoolInfo {
  pool_info: RawPoolInfo;
  value_of_user_stake: Uint256;
  size_of_users_tokens: Uint256;
}

export interface ParsedUserPoolInfo {
  poolInfo: PoolInfo;
  valueOfUserStakeBase: Int;
  valueOfUserStakeDecimal: Decimal;
  sizeOfUsersTokensBase: Int;
  sizeOfUsersTokensDecimal: Decimal;
}

export interface UserPoolInfo {
  raw: RawUserPoolInfo;
  parsed: ParsedUserPoolInfo;
}

export interface UserPoolDisplayData {
  size: Decimal;
  fullSize: Int;
  value: Decimal;
  fullValue: Int;
  type: OptionType;
}