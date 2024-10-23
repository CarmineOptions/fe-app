import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";

type DomainListResponse = {
  domain: string;
  address: string;
};

export const fetchDomains = async (
  addresses: string[]
): Promise<DomainListResponse[] | null> => {
  try {
    const body = {
      addresses,
    };

    const res = await fetch(`https://api.Starknet.id/addrs_to_domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as DomainListResponse[];

    return data ?? null;
  } catch (error) {
    return null;
  }
};

export const useDomains = (addresses: string[] | undefined) => {
  const { data, ...res } = useQuery({
    queryKey: [QueryKeys.userDomain, addresses],
    queryFn: async () => fetchDomains(addresses!),
    enabled: !!addresses,
  });

  return {
    ...res,
    domains: data as DomainListResponse[] | undefined | null,
  };
};
