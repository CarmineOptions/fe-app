import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../queries/keys";
import {
  fetchBraavosBonus,
  fetchTopUserPoints,
  fetchUserPoints,
} from "./fetch";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber, standardiseAddress } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";
import { useDomains } from "../../hooks/useDomains";
import { useDomain } from "../../hooks/useDomain";
import { Leaderboard } from "../Leaderboard";

const parseData = ({
  trading_points,
  liquidity_points,
  referral_points,
  vote_points,
  total_points,
}: {
  trading_points: number;
  liquidity_points: number;
  referral_points: number;
  vote_points: number;
  total_points: number;
}): [JSX.Element, JSX.Element, JSX.Element, JSX.Element, JSX.Element] => {
  return [
    <p>{formatNumber(trading_points)}</p>,
    <p>{formatNumber(liquidity_points)}</p>,
    <p>{formatNumber(referral_points)}</p>,
    <p>{formatNumber(vote_points)}</p>,
    <p>{formatNumber(total_points)}</p>,
  ];
};

export const PointsLeaderboard = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.topUserPoints],
    queryFn: fetchTopUserPoints,
  });
  const { data: braavosData } = useQuery({
    queryKey: [QueryKeys.braavosBonus],
    queryFn: fetchBraavosBonus,
  });
  const { data: currentUser } = useQuery({
    queryKey: [QueryKeys.userPoints, address],
    queryFn: async () => fetchUserPoints(address!),
    enabled: !!address,
  });
  const { username } = useDomain(address);
  const addresses = data
    ? data.map((p) => standardiseAddress(p.address))
    : undefined;
  const { domains } = useDomains(addresses);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <p>Error</p>;
  }

  const items = data.map(({ address, position, ...rest }) => {
    const username = domains
      ? domains.find(
          (d) => standardiseAddress(d.address) === standardiseAddress(address)
        )?.domain
      : undefined;
    return {
      position,
      address,
      username,
      data: parseData(rest),
    };
  });

  const user = currentUser && {
    position: currentUser.position,
    address: currentUser.address,
    username: username ? username : undefined,
    data: parseData(currentUser),
  };

  const header = [
    "#",
    "User",
    "Trading",
    "Liquidity",
    "Referral",
    "Vote",
    "Total",
  ];

  return (
    <Leaderboard
      header={header}
      items={items}
      user={user}
      braavos={braavosData}
      name="points"
    />
  );
};
