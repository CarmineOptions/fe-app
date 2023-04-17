import { getApiUrl } from "./../../utils/utils";
import { RawOptionHistory } from "./../../types/history";
import { QueryFunctionContext } from "react-query";
import { ITradeHistory, RawTradeHistory } from "../../types/history";
import { debug, LogTypes } from "../../utils/debugger";
import BN from "bn.js";
import { hexToBN } from "../../utils/utils";
import { Option } from "../../classes/Option";

const getOptionFromHistory = (option: RawOptionHistory | null) => {
  if (!option) {
    return null;
  }
  const raw = {
    option_side: new BN(option.option_side),
    maturity: new BN(option.maturity),
    strike_price: hexToBN(option.strike_price),
    quote_token_address: hexToBN(option.quote_token_address),
    base_token_address: hexToBN(option.base_token_address),
    option_type: new BN(option.option_type),
  };
  return new Option({ raw });
};

const parseHostoricDataResponse = (data: RawTradeHistory[]): ITradeHistory[] =>
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

export const fetchHistoricalData = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  ITradeHistory[]
> => {
  const walletAddress = queryKey[1];

  if (!walletAddress) {
    throw Error(
      `getHistoricalData did not get walletAddress: ${walletAddress}`
    );
  }

  const data = await fetch(
    `${getApiUrl()}transactions?address=${walletAddress}`
  )
    .then((res) => res.json())
    .then((v) => {
      if (v?.status === "success") {
        return v.data;
      }
      return [];
    })
    .catch((e) => {
      debug(LogTypes.WARN, "Failed fetching trade history\n", e);
    });

  if (data?.length) {
    return parseHostoricDataResponse(data);
  }
  return [];
};
