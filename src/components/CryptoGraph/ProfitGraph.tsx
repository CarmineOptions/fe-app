import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Tooltip,
  Line,
  ReferenceLine,
  YAxis,
} from "recharts";
import { CurrencyData, GraphData } from "./profitGraphData";
import { P3 } from "../common";

type ProfitGraphProps = {
  data: GraphData;
};

enum Color {
  Green = "#37CB4F",
  Red = "#BF1D1D",
}

type CustomTooltipProps = {
  active: boolean;
  color: Color;
  usd?: number;
  market?: number;
  currency: string;
};

export const ProfitGraph = ({ data }: ProfitGraphProps) => {
  const { currency, plot, domain } = data;
  const defaultTooltipData = {
    active: false,
    color: Color.Green,
    currency,
  };
  const [color, setColor] = useState<Color>(Color.Green);
  const [tooltipData, setTooltipData] =
    useState<CustomTooltipProps>(defaultTooltipData);

  const CustomTooltip = ({
    active,
    usd,
    market,
    color,
    currency,
  }: CustomTooltipProps) => {
    if (!active || usd === undefined) {
      return null;
    }
    return (
      <div className="flex flex-col">
        <P3 className="font-semibold">
          {currency}
          {market}
        </P3>
        <P3
          className={`font-semibold ${
            color === Color.Green
              ? "text-ui-successAccent"
              : "text-ui-errorAccent"
          }`}
        >
          {usd < 0 ? "Loss" : "Profit"} ${usd.toFixed(2)}
        </P3>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = (data: any) => {
    if (!data?.activePayload?.length) {
      return;
    }

    const payload: CurrencyData = data.activePayload[0].payload;

    if (payload) {
      const { usd, market } = payload;
      const color = usd >= 0 ? Color.Green : Color.Red;

      setColor(color);
      setTooltipData({ active: true, usd, market, color, currency });
    }
  };

  const handleMouseLeave = () => setTooltipData(defaultTooltipData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={plot}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <YAxis domain={domain} hide />
        <Tooltip
          content={
            <CustomTooltip
              active={tooltipData.active}
              usd={tooltipData.usd}
              market={tooltipData.market}
              color={tooltipData.color}
              currency={tooltipData.currency}
            />
          }
        />
        <Line
          strokeWidth={3}
          dot={false}
          type="linear"
          dataKey="usd"
          stroke={color}
        />
        <ReferenceLine y={0} stroke="#cccccc" strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  );
};
