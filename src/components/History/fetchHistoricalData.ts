import { IVote, RawOptionHistory } from "../../types/history";
import { ITradeHistory, RawTradeHistory } from "../../types/history";
import { debug, LogTypes } from "../../utils/debugger";
import { Option } from "../../classes/Option";
import { apiUrl } from "../../api";

const getOptionFromHistory = (option: RawOptionHistory | null) => {
  if (!option) {
    return null;
  }

  return new Option(
    option.base_token_address,
    option.quote_token_address,
    option.option_type,
    option.option_side,
    option.maturity,
    BigInt(option.strike_price)
  );
};

const parseHistoricDataResponse = (data: RawTradeHistory[]): ITradeHistory[] =>
  data.map((v) => {
    const option = getOptionFromHistory(v.option);
    const { timestamp, action, caller, capital_transfered, tokens_minted } = v;
    return {
      liquidity_pool: v.liquidity_pool,
      option: option,
      timestamp,
      action,
      caller,
      capital_transfered,
      tokens_minted,
    };
  });

type HistoricResponse = {
  tradeData: ITradeHistory[];
  votes: IVote[];
};

export const fetchHistoricalData = async (
  address: string
): Promise<HistoricResponse> => {
  const votesPromise = fetch(apiUrl(`votes?address=${address}`))
    .then((res) => res.json())
    .then((v) => {
      if (v?.status === "success") {
        return v.data;
      }
      return [];
    })
    .catch((e) => {
      debug(LogTypes.WARN, "Failed fetching vote history\n", e);
      return [];
    });

  const tradesPromise = fetch(apiUrl(`transactions?address=${address}`))
    .then((res) => res.json())
    .then((v) => {
      if (v?.status === "success") {
        return v.data;
      }
      return [];
    })
    .catch((e) => {
      debug(LogTypes.WARN, "Failed fetching trade history\n", e);
      return [];
    });

  const [votes, trades] = await Promise.all([votesPromise, tradesPromise]);

  return {
    tradeData: parseHistoricDataResponse(trades),
    votes,
  };
};
