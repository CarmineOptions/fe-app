import {
  Option,
  OptionTypeCall,
  OptionTypePut,
  OptionSideLong,
  OptionSideShort,
} from "carmine-sdk/core";

export type CurrencyData = { usd: number; market: number };

export type GraphData = {
  plot: CurrencyData[];
  domain: number[];
  currency: string;
};

const getStep = (spread: [number, number]): number => {
  const initial = Math.abs(spread[0] - spread[1]) / 500;

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
  const { strikePrice, optionType: type, optionSide: side } = option;

  // if premia is nearing 0, use 2% of strike price to calculate X axis
  const spreadPremia = Math.max(premia, strikePrice.val / 50);

  const spread = [
    Math.max(strikePrice.val - 10 * spreadPremia, 0),
    Math.min(strikePrice.val + 10 * spreadPremia, 2 * strikePrice.val),
  ];
  const step = getStep(spread as [number, number]);
  const granuality = 1 / step;

  console.log({
    spread,
    step,
    granuality,
    strikePrice: strikePrice.val,
    premia,
  });

  const plot = [];
  const currency = option.quote.symbol;

  if (side === OptionSideLong && type === OptionTypeCall) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y =
        x < strikePrice.val ? -premia : (x - strikePrice.val) * size - premia;

      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);

    return { plot, domain, currency };
  }

  if (side === OptionSideShort && type === OptionTypeCall) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y =
        x < strikePrice.val ? premia : (strikePrice.val - x) * size + premia;
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  if (side === OptionSideLong && type === OptionTypePut) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y =
        x < strikePrice.val ? (strikePrice.val - x) * size - premia : -premia;
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  if (side === OptionSideShort && type === OptionTypePut) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step, step);
      const y =
        x < strikePrice.val ? (x - strikePrice.val) * size + premia : premia;
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = getDomain(first, last);
    return { plot, domain, currency };
  }

  // Unreachable
  throw Error(`Invalid type or side ${type}, ${side}`);
};
