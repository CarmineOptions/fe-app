export type PoolData = {
  unlocked_cap: string;
  locked_cap: string;
  lp_balance: string;
  pool_position: string;
  lp_token_value: string;
  lp_token_value_usd: number;
  underlying_asset_price: number;
  block_number: number;
  lp_address: string;
  timestamp: number;
};

export type APYData = {
  week: number;
  week_annualized: number;
  launch: number;
  launch_annualized: number;
};

export type TokenPriceData = {
  eth: number;
  usdc: number;
  strk: number;
  btc: number;
};

export type ApiResponse<Data> = {
  status: "success" | "fail";
  data: Data;
};
