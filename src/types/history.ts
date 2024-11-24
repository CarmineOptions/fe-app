import { Option } from "../classes/Option";

export interface RawOptionHistory {
  option_side: number;
  maturity: number;
  strike_price: string;
  quote_token_address: string;
  base_token_address: string;
  option_type: number;
}

export interface RawTradeHistory {
  timestamp: number;
  action: string;
  caller: string;
  capital_transfered: string;
  tokens_minted: string;
  option: RawOptionHistory | null;
  liquidity_pool: string | null;
}

export interface ITradeData {
  timestamp: number;
  action: string;
  caller: string;
  capital_transfered: string;
  tokens_minted: string;
}

export interface ITradeHistory extends ITradeData {
  option: Option | null;
  liquidity_pool: string | null;
}

export interface ITrade extends ITradeData {
  option: Option;
}

export interface IStake extends ITradeData {
  liquidity_pool: string;
}

export interface IVote {
  user_address: string;
  prop_id: number;
  opinion: number;
  timestamp: number;
}
