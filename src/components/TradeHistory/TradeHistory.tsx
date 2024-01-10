import { Typography } from "@mui/material";
import { useQuery } from "react-query";

import { useAccount } from "../../hooks/useAccount";
import { QueryKeys } from "../../queries/keys";
import { LoadingAnimation } from "../Loading/Loading";
import { fetchHistoricalData } from "./fetchHistoricalData";
import { TransactionTable } from "./TransactionDisplay";

type PropsAddress = {
  address: string;
};

const TradeHistoryWithAddress = ({ address }: PropsAddress) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.tradeHistory, address],
    fetchHistoricalData
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return (
      <Typography>Something went wrong, please try again later</Typography>
    );
  }

  if (!data?.length) {
    return <Typography>We do not have any data on your past trades</Typography>;
  }

  const sorted = data.sort((a, b) => b.timestamp - a.timestamp);

  return <TransactionTable transactions={sorted} />;
};

export const TradeHistory = () => {
  const account = useAccount();

  if (!account) {
    return <p>Connect your wallet to see your trade history</p>;
  }

  return <TradeHistoryWithAddress address={account.address} />;
};
