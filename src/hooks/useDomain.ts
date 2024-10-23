import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";

type DomainResponse = { domain?: string; domain_expiry?: number };

export const fetchDomain = async (address: string): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://api.starknet.id/addr_to_domain?addr=${address}`
    );

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as DomainResponse;

    return body.domain ?? null;
  } catch (error) {
    return null;
  }
};

export const useDomain = (address: string | undefined) => {
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
