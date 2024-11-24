import { OptionType } from "./options";
import { Address, AddressBN, Decimal, Int, Math64, Math64BN } from "./units";
import { Uint256, uint256 } from "starknet";

export interface ParsedPool {
  quoteToken: string;
  baseToken: string;
  optionType: OptionType;
}

export interface RawPool {
  quote_token_address: bigint;
  base_token_address: bigint;
  option_type: bigint;
}

export interface RawPoolInfo extends RawPool {
  lptoken_address: AddressBN;
  staked_capital: Uint256; // lpool_balance
  unlocked_capital: Uint256;
  value_of_pool_position: Math64BN;
}

export interface ParsedPoolInfo extends ParsedPool {
  lptokenAddress: Address;
  stakedCapital: Int; // lpool_balance
  unlockedCapital: Int;
  valueOfPoolPosition: Math64;
}

export interface PoolInfo {
  raw: RawPoolInfo;
  parsed: ParsedPoolInfo;
}

export interface RawUserPoolInfo extends RawPoolInfo {
  value_of_user_stake: Uint256;
  size_of_users_tokens: Uint256;
}

export interface ParsedUserPoolInfo extends ParsedPoolInfo {
  valueOfUserStakeBase: Int;
  valueOfUserStakeDecimal: Decimal;
  sizeOfUsersTokensBase: Int;
  sizeOfUsersTokensDecimal: Decimal;
}

export interface UserPoolInfo {
  raw: RawUserPoolInfo;
  parsed: ParsedUserPoolInfo;
}

export interface ResponsePoolInfo {
  pool: RawPool;
  lptoken_address: AddressBN;
  staked_capital: bigint; // lpool_balance
  unlocked_capital: bigint;
  value_of_pool_position: Math64BN;
}

export interface ResponseUserPoolInfo {
  pool_info: ResponsePoolInfo;
  value_of_user_stake: bigint;
  size_of_users_tokens: bigint;
}
