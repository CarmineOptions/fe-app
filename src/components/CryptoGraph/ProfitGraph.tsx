import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Tooltip,
  Line,
  ReferenceLine,
} from "recharts";
import { Color } from "./Graph";
import { CurrencyData, GraphData } from "./profitGraphData";

type ProfitGraphProps = {
  data: GraphData;
};

type CustomTooltipProps = {
  active: boolean;
  color: Color;
  usd?: number;
  market?: number;
  currency: string;
};

export const ProfitGraph = ({ data }: ProfitGraphProps) => {
  const { currency, plot } = data;
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
    if (!active || !usd) {
      return null;
    }
    return (
      <div className="flex flex-col gap-2">
        <span>
          {currency}
          {market}
        </span>
        <span style={{ color }}>
          {usd < 0 ? "loss" : "profit"} ${usd.toFixed(2)}
        </span>
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
