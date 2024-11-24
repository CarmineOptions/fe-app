import { inputBaseClasses } from "@mui/material";
import {
  RawPool,
  ResponsePoolInfo,
  ResponseUserPoolInfo,
} from "../../types/pool";
import { debug } from "../debugger";

export const isInstanceOfPool = (input: unknown): input is RawPool => {
  if (!input) {
    return false;
  }

  const { quote_token_address, base_token_address, option_type } =
    input as RawPool;

  if (!quote_token_address || !base_token_address || !option_type) {
    return false;
  }

  return true;
};

export const isInstanceOfPoolInfo = (
  input: unknown
): input is ResponsePoolInfo => {
  if (!input) {
    return false;
  }

  const {
    pool,
    lptoken_address,
    staked_capital,
    unlocked_capital,
    value_of_pool_position,
  } = input as ResponsePoolInfo;
  if (!isInstanceOfPool(pool)) {
    return false;
  }
  if (
    !lptoken_address ||
    !value_of_pool_position ||
    !staked_capital ||
    !unlocked_capital
  ) {
    return false;
  }

  return true;
};

export const isInstanceOfUserPoolInfo = (
  input: unknown
): input is ResponseUserPoolInfo => {
  debug("isInstanceOfUserPoolInfo", input);

  if (!inputBaseClasses) {
    return false;
  }

  const { pool_info, value_of_user_stake, size_of_users_tokens } =
    input as ResponseUserPoolInfo;

  if (!isInstanceOfPoolInfo(pool_info)) {
    return false;
  }

  if (!value_of_user_stake || !size_of_users_tokens) {
    return false;
  }
  debug("isInstanceOfUserPoolInfo - validated");

  return true;
};
