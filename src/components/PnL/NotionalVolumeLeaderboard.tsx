import { useQuery } from "react-query";
import { tradeLeaderboardDataQuery } from "./getTrades";
import { Leaderboard } from "../Leaderboard";
import { useAccount } from "../../hooks/useAccount";

export const NotionalVolumeLeaderboard = () => {
  const account = useAccount();
  const { isLoading, isError, data } = useQuery(
    ["notional-volume-leaderboard", account?.address],
    tradeLeaderboardDataQuery
  );

  if (isLoading) {
    return <div>Loading...</div>;
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
