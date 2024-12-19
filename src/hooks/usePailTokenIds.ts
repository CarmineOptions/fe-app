import { QueryKeys } from "../queries/keys";
import { useAccount, useProvider } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "../api";
import { ApiResponse } from "../types/api";
import { ProviderInterface } from "starknet";
import { PAIL_NFT_ADDRESS } from "../constants/amm";
import { debug } from "../utils/debugger";

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

  return {
    live: Array.from(finalResult.live),
    expired: Array.from(finalResult.expired),
  };
};

const getChainVerifiedUserTokens = async (
  address: string,
  provider: ProviderInterface
) => {
  const tokensFromEvents = await getUserPailTokens(address);

  if (!tokensFromEvents) {
    return null;
  }

  const tokenIds = [...tokensFromEvents.live, ...tokensFromEvents.expired];
  const tokenIdsU256 = tokenIds.flatMap((n) => [n, 0]);
  const length = tokenIds.length;
  const addressArray = Array(length).fill(address);

  const res = await provider.callContract({
    contractAddress: PAIL_NFT_ADDRESS,
    entrypoint: "balanceOfBatch",
    calldata: [length, ...addressArray, length, ...tokenIdsU256],
  });

  const verifiedMap: {
    [key: number]: number;
  } = {};

  if (res.length !== tokenIdsU256.length + 1) {
    debug("Unexpected result size", { tokenIds, chainResult: res });
    return {
      live: [],
      expired: [],
    };
  }

  for (let i = 0; i < tokenIds.length; i += 1) {
    const id = tokenIds[i];
    const value = Number(res[1 + 2 * i]);

    verifiedMap[id] = value;
  }

  const verifiedLive = tokensFromEvents.live.filter((id) => !!verifiedMap[id]);
  const verifiedExpired = tokensFromEvents.expired.filter(
    (id) => !!verifiedMap[id]
  );

  return {
    live: verifiedLive,
    expired: verifiedExpired,
  };
};

export const usePailTokenIds = () => {
  const { address } = useAccount();
  const { provider } = useProvider();

  return useQuery({
    queryKey: [QueryKeys.pail, address],
    queryFn: async () => getChainVerifiedUserTokens(address!, provider!),
    enabled: !!address && !!provider,
  });
};
