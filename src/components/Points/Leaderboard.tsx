import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { UserPoints, fetchTopUserPoints } from "./fetch";
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

const Item = ({ data, position }: { data: UserPoints; position: number }) => {
  const {
    address,
    trading_points: tradePoints,
    liquidity_points: liqPoints,
    referral_points: refPoints,
  } = data;
  return (
    <TableRow>
      <TableCell>{position}</TableCell>
      <TableCell>{addressElision(address)}</TableCell>
      <TableCell>{tradePoints}</TableCell>
      <TableCell>{liqPoints}</TableCell>
      <TableCell>{refPoints}</TableCell>
      <TableCell>{tradePoints + liqPoints + refPoints}</TableCell>
    </TableRow>
  );
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
            <TableCell align="left">Trading</TableCell>
            <TableCell align="left">Liquidity</TableCell>
            <TableCell align="left">Referral</TableCell>
            <TableCell align="left">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data!.map((userPoints, i) => (
            <Item data={userPoints} position={i + 1} key={i} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
