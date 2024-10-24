import { debug } from "../../utils/debugger";
import { getUserPoolInfo } from "../../calls/getUserPoolInfo";
import { UserPoolInfo } from "../../classes/Pool";

export const fetchCapital = async (
  address: string
): Promise<UserPoolInfo[] | undefined> => {
  const userPools = await getUserPoolInfo(address);

  const withValue = userPools.filter((pool) => pool.size > 0 && pool.value > 0);

  debug("Parsed pools", { userPools, withValue });

  return withValue;
};
