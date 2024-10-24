import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "../../queries/keys";
import { LoadingAnimation } from "../Loading/Loading";
import { fetchHistoricalData } from "./fetchHistoricalData";
import { TransactionsTable } from "./TransactionDisplay";
import { IStake, ITrade } from "../../types/history";
import { useAccount } from "@starknet-react/core";

type PropsAddress = {
  address: string;
};

const TradeHistoryWithAddress = ({ address }: PropsAddress) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.tradeHistory, address],
    queryFn: async () => fetchHistoricalData(address),
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return (
      <Typography>Something went wrong, please try again later</Typography>
    );
  }

  if (!data) {
    return <Typography>We do not have any data on your past trades</Typography>;
  }

  const { tradeData, votes } = data;

  const sortedTrades = tradeData.sort((a, b) => b.timestamp - a.timestamp);

  const sortedVotes = votes.sort((a, b) => b.prop_id - a.prop_id);

  const trades = sortedTrades
    .filter((tx) => tx.option)
    .map(({ liquidity_pool, ...rest }) => rest as ITrade); // remove "liquidity_pool" in trades
  const stakes = sortedTrades
    .filter((tx) => tx.liquidity_pool)
    .map(({ option, ...rest }) => rest as IStake); // remove "option" in stakes

  return (
    <TransactionsTable trades={trades} stakes={stakes} votes={sortedVotes} />
  );
};

export const TradeHistory = () => {
  const { account } = useAccount();

  if (!account) {
    return <p>Connect your wallet to see your trade history</p>;
  }

  return <TradeHistoryWithAddress address={account.address} />;
};
