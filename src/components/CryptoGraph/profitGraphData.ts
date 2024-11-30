import { Option } from "../../classes/Option";
import { OptionSide, OptionType } from "../../types/options";

export type CurrencyData = { usd: number; market: number };

export type GraphData = {
  plot: CurrencyData[];
  domain: number[];
  currency: string;
};

const getStep = (spread: [number, number]): number => {
  const initial = Math.abs(spread[0] - spread[1]) / 500;
  console.log("INITIAL", initial, spread);

  const breakpoints = [5, 1, 0.5, 0.1, 0.05, 0.01];

  for (let i = 0; i < breakpoints.length; i++) {
    if (initial * 2 > breakpoints[i]) {
      return breakpoints[i];
    }
  }

  return 0.005;
};

const getDomain = (a: number, b: number): [number, number] => {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const abs = Math.abs(max - min);
  const change = 0.25 * abs;
  return [min - change, max + change];
};

const round = (n: number, step: number): number =>
  parseFloat((n - (n % (step / 5))).toFixed(6));

export const getProfitGraphData = (
  option: Option,
  premia: number,
  size: number
): GraphData => {
  const { strike: strikePrice, type, side } = option;

  // if premia is nearing 0, use 2% of strike price to calculate X axis
  const spreadPremia = Math.max(premia, strikePrice / 50);

  const spread = [
    Math.max(strikePrice - 10 * spreadPremia, 0),
    Math.min(strikePrice + 10 * spreadPremia, 2 * strikePrice),
  ];
  const step = getStep(spread as [number, number]);
  const granuality = 1 / step;

  console.log({ spread, step, granuality, strikePrice, premia });

  const plot = [];
  const currency = option.strikeCurrency;

  if (side === OptionSide.Long && type === OptionType.Call) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y = round(
        x < strikePrice ? -premia : (x - strikePrice) * size - premia,
        step
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);

    return { plot, domain, currency };
  }

  if (side === OptionSide.Short && type === OptionType.Call) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y = round(
        x < strikePrice ? premia : (strikePrice - x) * size + premia,
        step
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  if (side === OptionSide.Long && type === OptionType.Put) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y = round(
        x < strikePrice ? (strikePrice - x) * size - premia : -premia,
        step
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  if (side === OptionSide.Short && type === OptionType.Put) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y = round(
        x < strikePrice ? (x - strikePrice) * size + premia : premia,
        step
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  // Unreachable
  throw Error(`Invalid type or side ${type}, ${side}`);
};
