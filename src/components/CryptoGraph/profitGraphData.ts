import { Option } from "../../classes/Option";
import { TokenKey } from "../../classes/Token";
import { OptionSide, OptionType } from "../../types/options";

export type CurrencyData = { usd: number; market: number };

export type GraphData = {
  plot: CurrencyData[];
  domain: number[];
  currency: string;
};

const getStep = (option: Option): number => {
  if (option.baseToken.id === TokenKey.STRK) {
    return 0.001;
  }
  if (option.baseToken.id === TokenKey.BTC) {
    return 0.5;
  }
  return 0.1;
};

const round = (n: number): number => Number(n.toFixed(4));

export const getProfitGraphData = (
  option: Option,
  premia: number,
  size: number
): GraphData => {
  const { strike: strikePrice, type, side } = option;

  const step = getStep(option);
  const granuality = 1 / step;
  const spread = [0.85 * strikePrice, 1.15 * strikePrice];
  const plot = [];
  const currency = option.strikeCurrency;

  if (side === OptionSide.Long && type === OptionType.Call) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step);
      const y = round(
        x < strikePrice ? -premia : (x - strikePrice) * size - premia
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = [first - 0.2 * last, last];

    return { plot, domain, currency };
  }

  if (side === OptionSide.Short && type === OptionType.Call) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step);
      const y = round(
        x < strikePrice ? premia : (strikePrice - x) * size + premia
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = [last, first - 0.3 * last];

    return { plot, domain, currency };
  }

  if (side === OptionSide.Long && type === OptionType.Put) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step);
      const y = round(
        x < strikePrice ? (strikePrice - x) * size - premia : -premia
      );
      plot.push({ market: x, usd: y });
    }

    const [first, last] = [plot[0].usd, plot[plot.length - 1].usd];
    const domain = [last - 0.3 * first, first];

    return { plot, domain, currency };
  }

  if (side === OptionSide.Short && type === OptionType.Put) {
    for (let i = spread[0] * granuality; i <= spread[1] * granuality; i++) {
      const x = round(i * step);
      const y = round(
        x < strikePrice ? (x - strikePrice) * size + premia : premia
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
