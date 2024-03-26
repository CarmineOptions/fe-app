import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { UserPoints, fetchTopUserPoints, fetchUserPoints } from "./fetch";
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
import { addressElision } from "../../utils/utils";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";

export const ClickableUser = ({ address }: { address: string }) => (
  <a
    target="_blank"
    rel="noopener nofollow noreferrer"
    href={`https://starkscan.co/contract/${address}`}
  >
    {addressElision(address)}
  </a>
);

const Item = ({ data, sx }: { data: UserPoints; sx?: any }) => {
  const {
    address,
    trading_points: tradePoints,
    liquidity_points: liqPoints,
    referral_points: refPoints,
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
        <ClickableUser address={address} />
      </TableCell>
      <TableCell>{liqPoints}</TableCell>
      <TableCell>{tradePoints}</TableCell>
      <TableCell>{refPoints}</TableCell>
      <TableCell>{totalPoints}</TableCell>
    </TableRow>
  );
};

const UserItemWithAccount = ({ account }: { account: AccountInterface }) => {
  const { isLoading, isError, data } = useQuery(QueryKeys.userPoints, () =>
    fetchUserPoints(account.address)
  );

  if (isLoading || isError || !data) {
    return null;
  }

  return <Item data={data} sx={{ background: "#323232" }} />;
};

const UserItem = () => {
  const account = useAccount();

  if (!account) {
    return null;
  }

  return <UserItemWithAccount account={account} />;
};

export const Leaderboard = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.topUserPoints,
    fetchTopUserPoints
  );

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
            <TableCell>#</TableCell>
            <TableCell>User</TableCell>
            <TableCell align="left">Liquidity</TableCell>
            <TableCell align="left">Trading</TableCell>
            <TableCell align="left">Referral</TableCell>
            <TableCell align="left">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <UserItem />
          {data!.map((userPoints, i) => (
            <Item data={userPoints} key={i} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
