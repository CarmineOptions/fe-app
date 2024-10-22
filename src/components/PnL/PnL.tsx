import { useQuery } from "react-query";
import { userPnLQuery } from "./getTrades";
import { useAccount } from "@starknet-react/core";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProfitAndLossWithAddress = ({ address }: { address: string }) => {
  const { isLoading, isError, data } = useQuery(
    [`trades-with-prices-${address}`, address],
    userPnLQuery
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div>Something went wrong</div>;
  }

  // Convert timestamp to a readable date format for the X axis
  const formattedData = data.map((item) => ({
    usd: item.usd,
    date: new Date(item.ts * 1000).toLocaleDateString(),
  }));

  const formatDomain = ([min, max]: [number, number]): [number, number] => {
    const minPadding = Math.ceil(Math.max(Math.abs(min) * 0.2, 1));
    const maxPadding = Math.ceil(Math.max(Math.abs(max) * 0.2, 1));
    const padding = Math.max(minPadding, maxPadding);

    const finalDomain = [
      Math.min(Math.round(min) - padding, 0),
      Math.round(max) + padding,
    ] as [number, number];

    return finalDomain;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={formatDomain} />
        <Tooltip
          contentStyle={{
            backgroundColor: "black",
            border: "none",
          }}
          itemStyle={{ color: "#8884d8" }}
        />
        <Legend />
        <Line
          type="linear"
          dataKey="usd"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <ReferenceLine y={0} stroke="white" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ProfitAndLoss = () => {
  const { account } = useAccount();

  if (!account) {
    return <div>Need to connect wallet</div>;
  }

  return <ProfitAndLossWithAddress address={account.address} />;
};
