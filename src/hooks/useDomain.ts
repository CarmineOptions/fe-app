import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";

type DomainResponse = { domain?: string; domain_expiry?: number };

export const fetchDomain = async (address: string): Promise<string | null> => {
  const res = await fetch(
    `https://api.starknet.id/addr_to_domain?addr=${address}`
  );
  const body = (await res.json()) as DomainResponse;

  if (body.domain) {
    return body.domain;
  }

  return null;
};

export const useDomain = () => {
  const { address } = useAccount();

  const { data, ...res } = useQuery({
    queryKey: [QueryKeys.userDomain, address],
    queryFn: async () => fetchDomain(address!),
    enabled: !!address,
  });

  return {
    ...res,
    username: data as string | undefined | null,
  };
};
