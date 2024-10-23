import { useQuery } from "@tanstack/react-query";
import { tradeLeaderboardDataQuery } from "./getTrades";
import { Leaderboard } from "../Leaderboard";
import { useAccount } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";

export const NotionalVolumeLeaderboard = () => {
  const { account, address } = useAccount();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["notional-volume-leaderboard", address],
    queryFn: async () => tradeLeaderboardDataQuery(address!),
  });

  console.log("BATTLECHARTS", { isLoading, isError, data, error });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <div>Something went wrong</div>;
  }

  const [leaderboardUsers, currentUser] = data;

  const header = ["Rank", "Trader", "Profit/Loss", "Volume"];

  const parseData = (pnl: number, vol: number): [JSX.Element, JSX.Element] => {
    const isPnlNegative = pnl < 0;
    const PnlElem = (
      <span style={{ color: isPnlNegative ? "#CB3737" : "#37CB4F" }}>
        {isPnlNegative && "-"}${Math.abs(pnl).toFixed(2)}
      </span>
    );
    const VolElem = <span>${vol.toFixed(2)}</span>;

    return [PnlElem, VolElem];
  };

  const items = leaderboardUsers.map(
    ({ address, notionalVolume, pnl, position }) => ({
      position,
      address,
      data: parseData(pnl, notionalVolume),
    })
  );

  const user = currentUser && {
    position: currentUser.position,
    address: account!.address,
    data: parseData(currentUser.pnl, currentUser.notionalVolume),
  };

  return <Leaderboard header={header} items={items} user={user} />;
};
