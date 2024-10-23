import { debug } from "../../utils/debugger";
import { QueryFunctionContext } from "@tanstack/react-query";
import { getUserPoolInfo } from "../../calls/getUserPoolInfo";
import { UserPoolInfo } from "../../classes/Pool";

export const fetchCapital = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  UserPoolInfo[] | undefined
> => {
  const address = queryKey[1];

  if (address === undefined) return;

  const userPools = await getUserPoolInfo(address);

  const withValue = userPools.filter((pool) => pool.size > 0 && pool.value > 0);

  debug("Parsed pools", { userPools, withValue });

  return withValue;
};
