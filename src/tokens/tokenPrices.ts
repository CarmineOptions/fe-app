import { apiUrl } from "../api";
import { TokenKey } from "../classes/Token";

type RecentValue = {
  id: TokenKey;
  timestamp: number;
  value: number;
};

const getCoinInUsd = async (id: TokenKey): Promise<number> => {
  const url = apiUrl("token-prices");
  return fetch(url)
    .then((response) => response.json())
    .then((res) => {
      if (res.status === "success") {
        return res.data[id];
      }
      throw Error("Unexpected value for token-prices");
    })
    .catch((e) => {
      throw Error(e);
    });
};

const getMultipleCoinsInUsd = async (ids: TokenKey[]): Promise<number[]> =>
  fetch(apiUrl("token-prices"))
    .then((response) => response.json())
    .then((res) => {
      return ids.map((id) => res.data[id]);
    })
    .catch((e) => {
      console.error(e);
      throw Error("Failed getting multiple coins in usd");
    });

const freshTime = 2000; // 2s

const isFresh = (recent: RecentValue) =>
  recent.timestamp + freshTime > Date.now();

const tokenValueCache = new Map<TokenKey, RecentValue>();

const checkCache = (id: TokenKey): number | undefined => {
  const fromCache = tokenValueCache.get(id);

  if (fromCache && isFresh(fromCache)) {
    return fromCache.value;
  }
};

export const getTokenValueInUsd = async (id: TokenKey): Promise<number> => {
  const fromCache = checkCache(id);

  if (fromCache !== undefined) {
    return fromCache;
  }

  const value = await getCoinInUsd(id);
  const timestamp = Date.now();
  tokenValueCache.set(id, { value, timestamp, id });
  return value;
};

export const getMultipleTokensValueInUsd = async (
  ids: TokenKey[]
): Promise<number[]> => {
  const fromCache = ids.map((id) => checkCache(id));

  if (fromCache.every(Boolean)) {
    return fromCache as number[];
  }

  const values = await getMultipleCoinsInUsd(ids);
  const timestamp = Date.now();
  ids.forEach((id, index) => {
    tokenValueCache.set(id, { value: values[index], timestamp, id });
  });
  return values;
};
