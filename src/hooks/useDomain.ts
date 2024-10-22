import { QueryFunctionContext, useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";

type DomainResponse = { domain?: string; domain_expiry?: number };

export const queryDomain = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  string | undefined
> => {
  const address = queryKey[1];
  if (!address) return;

  const res = await fetch(
    `https://api.starknet.id/addr_to_domain?addr=${address}`
  );
  const body = (await res.json()) as DomainResponse;

  if (body.domain) {
    return body.domain;
  }
};

export const useDomain = () => {
  const { address } = useAccount();

  const key = `${QueryKeys.userDomain}-${address}`;

  const { data, ...res } = useQuery([key, address], queryDomain);

  return {
    ...res,
    username: data as string | undefined,
  };
};
