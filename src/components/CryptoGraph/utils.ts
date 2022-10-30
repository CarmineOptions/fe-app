import { AxisDomain } from "recharts/types/util/types";
import { isNonEmptyArray } from "../../utils/utils";

type Res = {
  prices?: number[];
};

export const getHistoricalChartUrl = (
  days = 365,
  id = "ethereum",
  currency = "usd"
) =>
  `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;

export const formatGraphDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString("en-GB");

const padding = 0.05;
const handleMin = (n: number) => Math.round(n * (1 - padding));
const handleMax = (n: number) => Math.round(n * (1 + padding));

export const graphDomain = [handleMin, handleMax] as AxisDomain;

export const validateResponse = (res: Res): boolean =>
  isNonEmptyArray(res?.prices);
