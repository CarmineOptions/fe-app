import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../queries/keys";
import {
  BraavosBonus,
  UserPoints,
  fetchBraavosBonus,
  fetchTopUserPoints,
  fetchUserPoints,
} from "./fetch";
import { LoadingAnimation } from "../Loading/Loading";
import tableStyles from "../../style/table.module.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { addressElision, standardiseAddress } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";
import { ReactNode } from "react";
import { BraavosBadge } from "./BraavosBadge";
import styles from "./points.module.css";
import { useDomains } from "../../hooks/useDomains";
import { useDomain } from "../../hooks/useDomain";

export const ClickableUser = ({
  address,
  username,
}: {
  address: string;
  username: string | undefined;
}) => (
  <a
    target="_blank"
    rel="noopener nofollow noreferrer"
    href={`https://starkscan.co/contract/${address}`}
    style={{ width: "115px" }}
  >
    {username ? username : addressElision(address)}
  </a>
);

const formatBigNumber = (n: number): string =>
  new Intl.NumberFormat("fr-FR").format(n); // French local uses space as separator

const Item = ({
  data,
  username,
  braavosBonus,
  sx,
}: {
  data: UserPoints;
  username?: string;
  braavosBonus?: BraavosBonus;
  sx?: any;
}) => {
  const {
    address,
    trading_points: tradePoints,
    liquidity_points: liqPoints,
    referral_points: refPoints,
    vote_points: votePoints,
    total_points: totalPoints,
    position,
  } = data;

  const displayPosition =
    position > 3
      ? position + ""
      : position === 1
      ? "🥇"
      : position === 2
      ? "🥈"
      : "🥉";

  return (
    <TableRow sx={sx}>
      <TableCell>{displayPosition}</TableCell>
      <TableCell>
        <div className={styles.leaderuser}>
          <ClickableUser address={address} username={username} />
          {braavosBonus && <BraavosBadge data={braavosBonus} />}
        </div>
      </TableCell>
      <TableCell>{formatBigNumber(liqPoints)}</TableCell>
      <TableCell>{formatBigNumber(tradePoints)}</TableCell>
      <TableCell>{formatBigNumber(refPoints)}</TableCell>
      <TableCell>{formatBigNumber(votePoints)}</TableCell>
      <TableCell>{formatBigNumber(totalPoints)}</TableCell>
    </TableRow>
  );
};

const UserItemWithAccount = ({
  address,
  braavosBonus,
}: {
  address: string;
  braavosBonus?: BraavosBonus;
}) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.userPoints, address],
    queryFn: async () => fetchUserPoints(address),
  });
  const { username } = useDomain(address);

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <Item
      data={data}
      username={username ? username : undefined}
      braavosBonus={braavosBonus}
      sx={{ background: "#323232" }}
    />
  );
};

const UserItem = ({
  braavos,
}: {
  braavos?: { [key: string]: BraavosBonus };
}) => {
  const { address } = useAccount();

  if (!address) {
    return null;
  }

  const braavosBonus = braavos && braavos[address];

  return <UserItemWithAccount braavosBonus={braavosBonus} address={address} />;
};

const Bold = ({ children }: { children: ReactNode }) => (
  <span style={{ fontWeight: "700" }}>{children}</span>
);

export const Leaderboard = () => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.topUserPoints],
    queryFn: fetchTopUserPoints,
  });
  const { data: braavosData } = useQuery({
    queryKey: [QueryKeys.braavosBonus],
    queryFn: fetchBraavosBonus,
  });
  const addresses = data
    ? data.map((p) => standardiseAddress(p.address))
    : undefined;
  const { domains } = useDomains(addresses);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <p>Error</p>;
  }

  return (
    <TableContainer>
      <Table className={tableStyles.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Bold>#</Bold>
            </TableCell>
            <TableCell>
              <Bold>User</Bold>
            </TableCell>
            <TableCell>
              <Bold>Liquidity</Bold>
            </TableCell>
            <TableCell>
              <Bold>Trading</Bold>
            </TableCell>
            <TableCell>
              <Bold>Referral</Bold>
            </TableCell>
            <TableCell>
              <Bold>Vote</Bold>
            </TableCell>
            <TableCell>
              <Bold>Total</Bold>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <UserItem braavos={braavosData} />
          {data!.map((userPoints, i) => {
            const username =
              domains?.find(
                (d) =>
                  standardiseAddress(d.address) ===
                  standardiseAddress(userPoints.address)
              )?.domain || undefined;
            return (
              <Item
                data={userPoints}
                username={username}
                braavosBonus={braavosData && braavosData[userPoints.address]}
                key={i}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
