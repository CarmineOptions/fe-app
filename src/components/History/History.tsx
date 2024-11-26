import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "../../queries/keys";
import { LoadingAnimation } from "../Loading/Loading";
import { fetchHistoricalData } from "./fetchHistoricalData";
import { TransactionsTable } from "./TransactionDisplay";
import { IStake, ITrade } from "../../types/history";
import { useAccount } from "@starknet-react/core";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";

export const TradeHistory = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.tradeHistory, address],
    queryFn: async () => fetchHistoricalData(address!),
    enabled: !!address,
  });

  if (!address) {
    return (
      <SecondaryConnectWallet msg="Connect your wallet to view your history." />
    );
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <p>Something went wrong, please try again later</p>;
  }

  if (!data) {
    return <p>We do not have any data on your past trades</p>;
  }

  const { tradeData, votes } = data;

  const sortedTrades = tradeData.sort((a, b) => b.timestamp - a.timestamp);

  const sortedVotes = votes.sort((a, b) => b.prop_id - a.prop_id);

  const trades = sortedTrades
    .filter((tx) => tx.option)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ liquidity_pool, ...rest }) => rest as ITrade); // remove "liquidity_pool" in trades
  const stakes = sortedTrades
    .filter((tx) => tx.liquidity_pool)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ option, ...rest }) => rest as IStake); // remove "option" in stakes

  return (
    <TransactionsTable trades={trades} stakes={stakes} votes={sortedVotes} />
  );
};
