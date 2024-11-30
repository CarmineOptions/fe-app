import { memo, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatGraphDate,
  getHistoricalChartUrl,
  getPercentage,
  graphDomain,
  validateResponse,
} from "./utils";
import { isNonEmptyArray } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { P3 } from "../common";

export type IHistoricData = Array<number[]>;

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  firstValue: number;
  color: "text-ui-successBg" | "text-ui-errorBg";
  setColor: (v: "text-ui-successBg" | "text-ui-errorBg") => void;
};

const CustomTooltip = memo(
  ({ active, payload, firstValue, color, setColor }: CustomTooltipProps) => {
    if (!active || !isNonEmptyArray(payload) || !payload[0].value) {
      return null;
    }
    const currentValue = payload[0].value;
    const newColor =
      currentValue < firstValue ? "text-ui-errorBg" : "text-ui-successBg";
    if (color !== newColor) {
      setColor(newColor);
    }
    return (
      <div className="flex flex-col">
        <P3 className="font-bold p-0 m-0">${currentValue}</P3>
        <P3 className="font-bold p-0 m-0">
          {getPercentage(firstValue, currentValue)}
        </P3>
      </div>
    );
  },
  (prev, next) => prev === next
);

type Props = {
  days: number;
};

const Graph = ({ days }: Props) => {
  const [historicData, setHistoricData] = useState<IHistoricData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState<"text-ui-successBg" | "text-ui-errorBg">(
    "text-ui-errorBg"
  );

  useEffect(() => {
    setLoading(true);
    fetch(getHistoricalChartUrl(days))
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then((data) => {
        if (validateResponse(data)) {
          return setHistoricData(data.prices);
        }
        throw Error("Failed to validate fetch data");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (!historicData || loading) {
    return <LoadingAnimation size={90} />;
  }

  if (error) {
    return <p>Something went wrong :( {error}</p>;
  }

  const data = historicData.map(([t, v]) => ({
    t: formatGraphDate(t),
    usd: v.toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis hide={true} dataKey="t" />
        <YAxis hide={true} domain={graphDomain} />
        <Tooltip
          content={
            <CustomTooltip
              firstValue={historicData[0][1]}
              color={color}
              setColor={setColor}
            />
          }
        />
        <Line
          strokeWidth={3}
          dot={false}
          type="monotone"
          dataKey="usd"
          stroke={color}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;
