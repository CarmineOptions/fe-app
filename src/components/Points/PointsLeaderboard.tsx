import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber, standardiseAddress } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";
import { useDomains } from "../../hooks/useDomains";
import { useDomain } from "../../hooks/useDomain";
import { Leaderboard } from "../Leaderboard";
import { useUserPoints } from "../../hooks/useUserPoints";
import { UserPoints } from "@carmine-options/sdk/api";

const parseData = ({
  tradePoints,
  liquidityPoints,
  referralPoints,
  votePoints,
  totalPoints,
}: Partial<UserPoints>): [
  JSX.Element,
  JSX.Element,
  JSX.Element,
  JSX.Element,
  JSX.Element
] => {
  return [
    <p>{formatNumber(tradePoints!)}</p>,
    <p>{formatNumber(liquidityPoints!)}</p>,
    <p>{formatNumber(referralPoints!)}</p>,
    <p>{formatNumber(votePoints!)}</p>,
    <p>{formatNumber(totalPoints!)}</p>,
  ];
};

export const PointsLeaderboard = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useUserPoints(address);
  const { username } = useDomain(address);
  const addresses = data
    ? data.top.map((p) => standardiseAddress(p.userAddress))
    : undefined;
  const { domains } = useDomains(addresses);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <p>Error</p>;
  }

  const items = data.top.map(({ userAddress, position, ...rest }) => {
    const username = domains
      ? domains.find(
          (d) =>
            standardiseAddress(d.address) === standardiseAddress(userAddress)
        )?.domain
      : undefined;
    return {
      position,
      address: userAddress,
      username,
      data: parseData(rest),
    };
  });

  const user = data.user && {
    position: data.user.position,
    address: data.user.userAddress,
    username: username ? username : undefined,
    data: parseData(data.user),
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
      // braavos={braavosData}
      name="points"
    />
  );
};
