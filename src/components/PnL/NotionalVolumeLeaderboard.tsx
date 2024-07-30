import { useQuery } from "react-query";
import { notionalVolumeQuery } from "./getTrades";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ClickableUser } from "../Points/Leaderboard";

import styles from "../Points/points.module.css";
import tableStyles from "../../style/table.module.css";
import { ReactNode } from "react";

const Item = ({
  volume,
  address,
  position,
  sx,
}: {
  volume: number;
  address: string;
  position: number;
  sx?: any;
}) => {
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
          <ClickableUser address={address} />
        </div>
      </TableCell>
      <TableCell>${volume.toFixed(2)}</TableCell>
    </TableRow>
  );
};

const Bold = ({ children }: { children: ReactNode }) => (
  <span style={{ fontWeight: "700" }}>{children}</span>
);

export const NotionalVolumeLeaderboard = () => {
  const { isLoading, isError, data } = useQuery(
    ["notional-volume-leaderboard"],
    notionalVolumeQuery
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div>Something went wrong</div>;
  }

  const sortedCallers = Object.entries(data)
    .sort(([, a], [, b]) => b - a) // Sort by the number in descending order
    .slice(0, 20); // Extract the top 20 callers

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
              <Bold>Notional Volume</Bold>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCallers.map(([address, notionalVolumeUsd], i) => (
            <Item
              volume={notionalVolumeUsd}
              address={address}
              position={i + 1}
              key={i}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
