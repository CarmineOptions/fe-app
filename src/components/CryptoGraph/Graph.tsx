import { memo, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
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

export type IHistoricData = Array<number[]>;

export const enum Color {
  Green = "#008000",
  Red = "#B22222",
}

const CustomTooltip = memo(
  ({ active, payload, firstValue, color, setColor }: any) => {
    if (!active || !isNonEmptyArray(payload) || !payload[0].value) {
      return null;
    }
    const currentValue = payload[0].value;
    const newColor = currentValue < firstValue ? Color.Red : Color.Green;
    if (color !== newColor) {
      setColor(newColor);
    }
    return (
      <Box>
        <Typography sx={{ color, fontWeight: "800" }}>
          ${currentValue}
        </Typography>
        <Typography sx={{ color }}>
          {getPercentage(firstValue, currentValue)}
        </Typography>
      </Box>
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
  const [color, setColor] = useState<Color>(Color.Green);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
