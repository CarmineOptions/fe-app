import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchUserPoints } from "./fetch";
import { LoadingAnimation } from "../Loading/Loading";
import { AccountInterface } from "starknet";
import { useAccount } from "../../hooks/useAccount";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import tableStyles from "../../style/table.module.css";

type Props = {
  account: AccountInterface;
};

const WithAccount = ({ account }: Props) => {
  const { isLoading, isError, data } = useQuery(QueryKeys.userPoints, () =>
    fetchUserPoints(account.address)
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <p>Error</p>;
  }

  if (!data) {
    // user not in the points hashmap
    return <p>You currently do not have any points</p>;
  }

  const {
    trading_points: tradePoints,
    liquidity_points: liqPoints,
    referral_points: refPoints,
  } = data;

  return (
    <TableContainer>
      <Table className={tableStyles.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Trading</TableCell>
            <TableCell align="left">Liquidity</TableCell>
            <TableCell align="left">Referral</TableCell>
            <TableCell align="left">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{tradePoints}</TableCell>
            <TableCell>{liqPoints}</TableCell>
            <TableCell>{refPoints}</TableCell>
            <TableCell>{tradePoints + liqPoints + refPoints}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const UserPoints = () => {
  const account = useAccount();

  if (!account) {
    return <p>Connect wallet to see your points</p>;
  }

  return <WithAccount account={account} />;
};
