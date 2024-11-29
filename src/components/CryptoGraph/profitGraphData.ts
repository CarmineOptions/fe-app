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

  const breakpoints = [1, 0.5, 0.1, 0.05, 0.01];

  for (let i = 0; i < breakpoints.length; i++) {
    if (initial * 2 > breakpoints[i]) {
      return breakpoints[i];
    }
  }

  return 0.005;
};

const round = (n: number, step: number): number =>
  parseFloat((n - (n % (step / 5))).toFixed(6));

export const getProfitGraphData = (
  option: Option,
  premia: number,
  size: number
): GraphData => {
  const { strike: strikePrice, type, side } = option;

  const spread = [
    Math.max(strikePrice - 10 * premia, 0),
    Math.min(strikePrice + 10 * premia, 2 * strikePrice),
  ];
  const step = getStep(spread as [number, number]);
  const granuality = 1 / step;

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
    const domain = [first - 0.2 * last, last];

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
    const domain = [last, first - 0.3 * last];

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
    const domain = [last - 0.3 * first, first];

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
    const domain = [first, last - 0.3 * first];

    return { plot, domain, currency };
  }

  // Unreachable
  throw Error(`Invalid type or side ${type}, ${side}`);
};
