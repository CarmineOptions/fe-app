import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../api";
import { ApiResponse } from "../types/api";

type PailEventOpen = {
  user: string;
  hedge_token_id: number;
  amount: string;
  quote_token: string;
  base_token: string;
  maturity: number;
  at_price: string;
  event: "hedge_open";
};

type PailEventClose = {
  user: string;
  hedge_token_id: number;
  event: "hedge_close" | "hedge_settle";
};

type PailEvent = PailEventOpen | PailEventClose;

export const fetchPailEvents = async (
  address: string
): Promise<PailEvent[] | null> => {
  try {
    const res = await fetch(`${apiUrl("pail_events")}?address=${address}`);

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as ApiResponse<PailEvent[]>;

    return body.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getUserPailTokens = async (address: string) => {
  const res = await fetchPailEvents(address);
  if (!res) {
    return;
  }

  const currentTime = Date.now() / 1000;

  const finalResult = res.reduce<{
    live: Set<number>;
    expired: Set<number>;
  }>(
    (acc, event) => {
      if (event.event === "hedge_open") {
        if (event.maturity < currentTime) {
          acc.expired.add(event.hedge_token_id);
        } else {
          acc.live.add(event.hedge_token_id);
        }
      } else if (
        event.event === "hedge_close" ||
        event.event === "hedge_settle"
      ) {
        acc.live.delete(event.hedge_token_id);
        acc.expired.delete(event.hedge_token_id);
      }
      return acc;
    },
    { live: new Set<number>(), expired: new Set<number>() }
  );

  console.log(res, finalResult);

  return {
    live: Array.from(finalResult.live),
    expired: Array.from(finalResult.expired),
  };
};

export const usePailTokenIds = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: [QueryKeys.pail, address],
    queryFn: async () => getUserPailTokens(address!),
    enabled: !!address,
  });
};
