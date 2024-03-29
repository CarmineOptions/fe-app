import { ETH_DIGITS } from "../../constants/amm";
import { IStake, ITrade } from "../../types/history";
import { shortInteger } from "../../utils/computations";
import { timestampToDateAndTime } from "../../utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import tableStyles from "../../style/table.module.css";
import { borderValue } from "../../style/sx";

type TransactionsTableProps = {
  trades: ITrade[];
  stakes: IStake[];
};

type TradesTableProps = {
  trades: ITrade[];
};

type StakesTableProps = {
  stakes: IStake[];
};

type SingleTradeProp = {
  trade: ITrade;
};

type SingleStakeProp = {
  stake: IStake;
};

const SingleTrade = ({ trade }: SingleTradeProp) => {
  const { option, timestamp, action, tokens_minted } = trade;

  console.log({ tokens_minted: BigInt(tokens_minted), digits: option.digits });

  const size = shortInteger(BigInt(tokens_minted).toString(10), ETH_DIGITS);

  const [date, time] = timestampToDateAndTime(timestamp * 1000);

  return (
    <TableRow>
      <TableCell>{date}</TableCell>
      <TableCell sx={{ borderRight: borderValue }}>{time}</TableCell>
      <TableCell>{timestampToDateAndTime(option.maturity * 1000)[0]}</TableCell>
      <TableCell align="left">{action}</TableCell>
      <TableCell align="left">{`${option.sideAsText} ${option.typeAsText} ${option.pairId}`}</TableCell>
      <TableCell align="left">{`$${option.strike}`}</TableCell>
      <TableCell align="left">{size.toFixed(4)}</TableCell>
    </TableRow>
  );
};

export const TradesTable = ({ trades }: TradesTableProps) => {
  const [expanded, setExpanded] = useState(false);

  const COLLAPSED_LENGTH = 5;

  const size = expanded ? trades.length : COLLAPSED_LENGTH;

  return (
    <TableContainer>
      <Table className={tableStyles.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell sx={{ borderRight: borderValue }}>Time</TableCell>
            <TableCell align="left">Maturity</TableCell>
            <TableCell align="left">Action</TableCell>
            <TableCell align="left">Option</TableCell>
            <TableCell align="left">Strike Price</TableCell>
            <Tooltip
              placement="top"
              title="Amount of tokens transfered divided by 10^18"
            >
              <TableCell align="left">Size</TableCell>
            </Tooltip>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.slice(0, size).map((trade, i) => (
            <SingleTrade trade={trade} key={i} />
          ))}
          {trades.length > COLLAPSED_LENGTH && (
            <TableRow>
              <td
                onClick={() => setExpanded(!expanded)}
                colSpan={7}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                {expanded ? "Show less" : "Show more"}
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const SingleStake = ({ stake }: SingleStakeProp) => {
  const { liquidity_pool, timestamp, action, tokens_minted } = stake;

  const size = shortInteger(BigInt(tokens_minted).toString(10), ETH_DIGITS);

  const [date, time] = timestampToDateAndTime(timestamp * 1000);

  return (
    <TableRow>
      <TableCell>{date}</TableCell>
      <TableCell sx={{ borderRight: borderValue }}>{time}</TableCell>
      <TableCell align="left">{action}</TableCell>
      <TableCell align="left">{liquidity_pool}</TableCell>
      <Tooltip title={size}>
        <TableCell align="left">{size.toFixed(4)}</TableCell>
      </Tooltip>
    </TableRow>
  );
};

export const StakesTable = ({ stakes }: StakesTableProps) => {
  const [expanded, setExpanded] = useState(false);

  const COLLAPSED_LENGTH = 5;

  const size = expanded ? stakes.length : COLLAPSED_LENGTH;

  return (
    <TableContainer>
      <Table className={tableStyles.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell sx={{ borderRight: borderValue }}>Time</TableCell>
            <TableCell align="left">Action</TableCell>
            <TableCell align="left">Pool</TableCell>
            <Tooltip
              placement="top"
              title="Amount of tokens transfered divided by 10^18"
            >
              <TableCell align="left">Size</TableCell>
            </Tooltip>
          </TableRow>
        </TableHead>
        <TableBody>
          {stakes.slice(0, size).map((stake, i) => (
            <SingleStake stake={stake} key={i} />
          ))}
          {stakes.length > COLLAPSED_LENGTH && (
            <TableRow>
              <td
                onClick={() => setExpanded(!expanded)}
                colSpan={7}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                {expanded ? "Show less" : "Show more"}
              </td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const TransactionsTable = ({
  trades,
  stakes,
}: TransactionsTableProps) => {
  return (
    <div>
      <h3>Trade History</h3>
      <TradesTable trades={trades} />
      <h3 style={{ marginTop: "40px" }}>Liquidity History</h3>
      <StakesTable stakes={stakes} />
    </div>
  );
};
