import { UserPoolInfo } from "../../classes/Pool";
import { ResponseUserPoolInfo } from "../../types/pool";
import { uint256 } from "starknet";

export const parseUserPoolInfo = (
  response: ResponseUserPoolInfo
): UserPoolInfo => {
  const {
    pool_info: poolInfo,
    value_of_user_stake: value,
    size_of_users_tokens: size,
  } = response;
  const {
    base_token_address: base,
    quote_token_address: quote,
    option_type: type,
  } = poolInfo.pool;

  return new UserPoolInfo(
    base,
    quote,
    type,
    uint256.uint256ToBN(size),
    uint256.uint256ToBN(value)
  );
};
