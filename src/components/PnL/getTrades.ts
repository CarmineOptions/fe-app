import { standardiseAddress } from "./../../utils/utils";
import { QueryFunctionContext } from "@tanstack/react-query";
import { apiUrl } from "../../api";

export type TradeWithPrices = {
  timestamp: number;
  action: string;
  caller: string;
  capital_transfered: number;
  capital_transfered_usd: number;
  underlying_asset_price_usd: number;
  tokens_minted: number;
  premia: number;
  premia_usd: number;
  option_side: number;
  option_type: number;
  maturity: number;
  strike_price: number;
  pool_id: string;
};

export type PnL = {
  ts: number;
  usd: number;
  change: number;
  side: number;
  pool: string;
};

export const getUserTrades = async (
  address: string
): Promise<TradeWithPrices[]> => {
  const res = await fetch(apiUrl(`/trades?address=${address}`)).then((r) =>
    r.json()
  );

  if (res && res?.status === "success") {
    return res.data as TradeWithPrices[];
  }

  throw Error("Failed getting trades with prices");
};

export const getAllTrades = async (): Promise<TradeWithPrices[]> => {
  const res = await fetch(apiUrl("trades")).then((r) => r.json());

  if (res && res?.status === "success") {
    return res.data as TradeWithPrices[];
  }

  throw Error("Failed getting trades with prices");
};

export const userTradeQuery = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<TradeWithPrices[]> => {
  const userAddress = queryKey[1];

  return getUserTrades(userAddress);
};

const calculatePnL = (trades: TradeWithPrices[]): PnL[] => {
  const sortedTrades = trades.sort((a, b) => a.timestamp - b.timestamp);
  const fees = 0.03;
  let balance = 0;
  const pnl = [];

  const openShorts: {
    [key: string]: number;
  } = {};

  for (const trade of sortedTrades) {
    if (trade.action === "TradeOpen") {
      // open long position -> pay premia
      if (trade.option_side === 0) {
        const change = -trade.premia_usd;
        balance += change;
        pnl.push({
          ts: trade.timestamp,
          usd: balance,
          change,
          side: trade.option_side,
          pool: trade.pool_id,
        });
      }
      // open short position -> keep track, change p&l when settled
      if (trade.option_side === 1) {
        const key = trade.pool_id + trade.strike_price + trade.maturity;
        const tokens = trade.premia * (1 - fees) + trade.capital_transfered;
        if (openShorts[key] !== undefined) {
          openShorts[key] += tokens;
        } else {
          openShorts[key] = tokens;
        }
      }
    }
    if (trade.action === "TradeSettle") {
      // settle long position - receive money (zero if OotM)
      if (trade.option_side === 0) {
        const change = trade.capital_transfered_usd;
        if (change !== 0) {
          balance += change;
          pnl.push({
            ts: trade.timestamp,
            usd: balance,
            change,
            side: trade.option_side,
            pool: trade.pool_id,
          });
        }
      }
      // check how much was locked and how much was returned
      if (trade.option_side === 1) {
        const key = trade.pool_id + trade.strike_price + trade.maturity;
        const prev = openShorts[key];
        const diff = prev - trade.capital_transfered;
        const change = diff * trade.underlying_asset_price_usd;
        if (change !== 0) {
          balance += change;
          pnl.push({
            ts: trade.timestamp,
            usd: balance,
            change,
            side: trade.option_side,
            pool: trade.pool_id,
          });
        }
      }
    }
    if (trade.action === "TradeClose") {
      // settle long position - receive money (zero if OotM)
      if (trade.option_side === 0) {
        const change = trade.capital_transfered_usd;
        if (change !== 0) {
          balance += change;
          pnl.push({
            ts: trade.timestamp,
            usd: balance,
            change,
            side: trade.option_side,
            pool: trade.pool_id,
          });
        }
      }
      // check how much was locked and how much was returned
      if (trade.option_side === 1) {
        const key = trade.pool_id + trade.strike_price + trade.maturity;
        const prev = openShorts[key];
        const diff = prev - trade.capital_transfered;
        const change = diff * trade.underlying_asset_price_usd;
        if (change !== 0) {
          balance += change;
          pnl.push({
            ts: trade.timestamp,
            usd: balance,
            change,
            side: trade.option_side,
            pool: trade.pool_id,
          });
        }
      }
    }
  }

  return pnl;
};

export const userPnLQuery = async (address: string): Promise<PnL[]> => {
  const trades = await getUserTrades(address);

  return calculatePnL(trades);
};

const calculateNotionalVolumeSingleUser = (
  trades: TradeWithPrices[]
): number => {
  let total = 0;
  const filtered = trades.filter((t) => t.action === "TradeOpen");
  filtered.forEach((trade) => {
    if (trade.option_type === 1) {
      total +=
        trade.underlying_asset_price_usd *
        trade.strike_price *
        trade.tokens_minted;
    } else {
      total += trade.underlying_asset_price_usd * trade.tokens_minted;
    }
  });

  return total;
};

const calculateNotionalVolume = (
  trades: TradeWithPrices[]
): { [key: string]: number } => {
  const userMap: { [key: string]: TradeWithPrices[] } = trades.reduce(
    (acc, obj) => {
      const key = obj.caller;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    },
    {} as { [key: string]: TradeWithPrices[] }
  );

  const result = Object.keys(userMap).reduce((acc, key) => {
    acc[key] = calculateNotionalVolumeSingleUser(userMap[key]);
    return acc;
  }, {} as { [key: string]: number });

  return result;
};

type TradeLeaderboardData = {
  address: string;
  notionalVolume: number;
  pnl: number;
  position: number;
};

const calculateLeaderboardData = (
  trades: TradeWithPrices[],
  address: string | undefined
): [TradeLeaderboardData[], TradeLeaderboardData | undefined] => {
  const userMap: { [key: string]: TradeWithPrices[] } = trades.reduce(
    (acc, obj) => {
      const key = obj.caller;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    },
    {} as { [key: string]: TradeWithPrices[] }
  );

  const richData = Object.keys(userMap).reduce((acc, address) => {
    const trades = userMap[address];
    const notionalVolume = calculateNotionalVolumeSingleUser(trades);
    const pnl = calculatePnL(trades).at(-1)?.usd || 0;
    acc[address] = {
      address: standardiseAddress(address),
      notionalVolume,
      pnl,
      position: 0,
    };
    return acc;
  }, {} as { [key: string]: TradeLeaderboardData });

  const sortedCallers = Object.values(richData).sort(
    ({ pnl: a }, { pnl: b }) => b - a
  );

  const topUsers = sortedCallers.slice(0, 20); // Extract the top 20 callers

  const tradeLeaderboardData = topUsers.map(
    ({ address, notionalVolume, pnl }, i) => ({
      address,
      notionalVolume,
      position: i + 1,
      pnl,
    })
  );

  if (!address) {
    return [tradeLeaderboardData, undefined];
  }

  const stdAddress = standardiseAddress(address);

  const index = sortedCallers.findIndex(
    ({ address }) => address === stdAddress
  );

  const user = {
    address: stdAddress,
    notionalVolume: calculateNotionalVolumeSingleUser(userMap[stdAddress]),
    position: index + 1,
    pnl: calculatePnL(userMap[stdAddress]).at(-1)?.usd || 0,
  };

  return [tradeLeaderboardData, user];
};

export const notionalVolumeQuery = async (): Promise<{
  [key: string]: number;
}> => {
  const allTrades = await getAllTrades();
  return calculateNotionalVolume(allTrades);
};

export const tradeLeaderboardDataQuery = async (
  address: string | undefined
): Promise<[TradeLeaderboardData[], TradeLeaderboardData | undefined]> => {
  const allTrades = await getAllTrades();
  return calculateLeaderboardData(allTrades, address);
};
