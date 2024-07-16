import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { shortInteger } from "../../utils/computations";
import { maxDecimals } from "../../utils/utils";

import styles from "./history.module.css";
import tableStyles from "../../style/table.module.css";

type Props = {
  claimed: bigint;
  allocation: bigint[];
};

type RoundInfo = {
  cum: bigint;
  alloc: bigint;
  round: number;
  claimed: bigint;
};

const roundTimestamps = [
  1713398400, 1714608000, 1715817600, 1717027200, 1718236800, 1719446400,
  1720656000, 1721865600,
];

export const timestampToShortUTC = (ts: number): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(ts * 1000);

const Item = ({ info }: { info: RoundInfo }) => {
  const { cum, alloc, round, claimed } = info;
  const humanReadableAlloc = maxDecimals(shortInteger(alloc, 18), 4);
  const start = timestampToShortUTC(roundTimestamps[round - 1]);
  const end = timestampToShortUTC(roundTimestamps[round]);

  return (
    <TableRow>
      <td className={styles.datecontainer}>
        <span>{start}</span>
        <span>-</span>
        <span>{end}</span>
      </td>
      <td></td>
      <td>
        <div className={styles.alloccontainer}>
          <span>{cum <= claimed ? "Claimed ✅" : "Claimable"}</span>
          <span>STRK {humanReadableAlloc}</span>
        </div>
      </td>
    </TableRow>
  );
};

export const DefiSpringHistory = ({ claimed, allocation }: Props) => {
  const roundInformations = allocation.map((cum, i) => {
    const round = i + 1;
    const alloc = i > 0 ? cum - allocation[i - 1] : cum;

    return {
      cum,
      alloc,
      round,
      claimed,
    };
  });

  const now = Date.now() / 1000;
  const currentRoundStart = roundTimestamps[allocation.length];
  const currentRoundEnd = roundTimestamps[allocation.length + 1];

  const totalDuration = currentRoundEnd - currentRoundStart;

  // Calculate the duration that has elapsed from start to now
  const elapsedDuration = now - currentRoundStart;

  // Calculate the percentage of the period that has elapsed
  const percentageElapsed = (elapsedDuration / totalDuration) * 100;

  return (
    <TableContainer>
      <Table className={tableStyles.table}>
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell>Allocation</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roundInformations.map((info, i) => (
            <Item key={i} info={info} />
          ))}
          <TableRow>
            <td className={styles.datecontainer}>
              <span>
                {timestampToShortUTC(roundTimestamps[allocation.length])}
              </span>
              <span>-</span>
              <span>
                {timestampToShortUTC(roundTimestamps[allocation.length + 1])}
              </span>
            </td>
            <td>
              <div className={styles.slidebase}>
                <div
                  style={{ width: `${percentageElapsed}%` }}
                  className={styles.slide}
                ></div>
              </div>
            </td>
            <td>In progress</td>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
