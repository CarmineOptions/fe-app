import { useQuery } from "@tanstack/react-query";
import { tradeLeaderboardDataQuery } from "./getTrades";
import { Leaderboard } from "../Leaderboard";
import { useAccount } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";
import { useDomains } from "../../hooks/useDomains";
import { formatNumber, standardiseAddress } from "../../utils/utils";
import { useDomain } from "../../hooks/useDomain";

export const NotionalVolumeLeaderboard = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: ["notional-volume-leaderboard", address],
    queryFn: async () => tradeLeaderboardDataQuery(address!),
    enabled: !!address,
  });
  const addresses = data ? data[0].map((t) => t.address) : undefined;
  const { domains } = useDomains(addresses);
  const { username } = useDomain(address);

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
      <p style={{ color: isPnlNegative ? "#CB3737" : "#37CB4F" }}>
        {isPnlNegative && "-"}${formatNumber(Math.abs(pnl))}
      </p>
    );
    const VolElem = <p>${formatNumber(vol)}</p>;

    return [PnlElem, VolElem];
  };

  const items = leaderboardUsers.map(
    ({ address, notionalVolume, pnl, position }) => {
      const username = domains
        ? domains.find(
            (d) => standardiseAddress(d.address) === standardiseAddress(address)
          )?.domain
        : undefined;
      return {
        position,
        address,
        username,
        data: parseData(pnl, notionalVolume),
      };
    }
  );

  const user = currentUser && {
    position: currentUser.position,
    address: address!,
    username: username ? username : undefined,
    data: parseData(currentUser.pnl, currentUser.notionalVolume),
  };

  return (
    <Leaderboard header={header} items={items} user={user} name="battle" />
  );
};
