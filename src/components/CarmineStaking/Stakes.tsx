import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useState } from "react";

import { CarmineStake } from "../../classes/CarmineStake";
import { shortInteger } from "../../utils/computations";
import { StakingModal } from "./StakingModal";

import tableStyles from "../../style/table.module.css";
import buttonStyles from "../../style/button.module.css";
import { UnstakeModal } from "./UnstakeModal";

const Item = ({ stake }: { stake: CarmineStake }) => {
  return (
    <TableRow>
      <TableCell>{stake.startDate}</TableCell>
      <TableCell>{stake.endDate}</TableCell>
      <TableCell>{stake.period}</TableCell>
      <TableCell>{stake.amountStakedHumanReadable}</TableCell>
      <TableCell>{stake.amountVotingTokenHumanReadable}</TableCell>
    </TableRow>
  );
};

const InitialVeCarmItem = ({ amount }: { amount: bigint }) => {
  const [open, setOpen] = useState(false);

  return (
    <TableRow>
      <TableCell>--</TableCell>
      <TableCell>--</TableCell>
      <TableCell>--</TableCell>
      <TableCell>{shortInteger(amount, 18)}</TableCell>
      <TableCell>0</TableCell>
      <TableCell>
        <button
          className={buttonStyles.secondary}
          onClick={() => setOpen(true)}
        >
          Restake & Unstake
        </button>
        <StakingModal amount={amount} open={open} setOpen={setOpen} />
      </TableCell>
    </TableRow>
  );
};

const ExpiredItem = ({ stake }: { stake: CarmineStake }) => {
  const [open, setOpen] = useState(false);
  return (
    <TableRow>
      <TableCell>{stake.startDate}</TableCell>
      <TableCell>{stake.endDate}</TableCell>
      <TableCell>{stake.period}</TableCell>
      <TableCell>{stake.amountStakedHumanReadable}</TableCell>
      <TableCell>0</TableCell>
      <TableCell>
        <button
          onClick={() => setOpen(true)}
          className={buttonStyles.secondary}
        >
          Restake & Unstake
        </button>
        <UnstakeModal stake={stake} open={open} setOpen={setOpen} />
      </TableCell>
    </TableRow>
  );
};

type Props = {
  stakes: CarmineStake[];
  veBalance: bigint;
};

export const Stakes = ({ stakes, veBalance }: Props) => {
  const balanceInStakes = stakes.reduce((acc, cur) => {
    if (cur.isNotWithdrawn) {
      return acc + cur.amountVotingToken;
    }
    return acc;
  }, 0n);

  const active = stakes.filter((s) => s.isActive);
  const expired = stakes.filter((s) => s.isExpired);

  const initialVeCarm = veBalance - balanceInStakes;

  return (
    <div>
      <div className="divider topmargin botmargin" />
      <h2 className="botmargin">Expired stakes</h2>
      {expired.length > 0 || initialVeCarm > 0n ? (
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Voting power</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initialVeCarm > 0n && (
                <InitialVeCarmItem amount={initialVeCarm} />
              )}
              {expired.map((stake, i) => (
                <ExpiredItem stake={stake} key={i} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No expired stakes</p>
      )}
      <div className="divider topmargin botmargin" />
      <h2 className="botmargin">Active stakes</h2>
      {active.length > 0 ? (
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Voting power</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {active
                .sort((a, b) => b.start - a.start)
                .map((stake, i) => (
                  <Item stake={stake} key={i} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No active stakes</p>
      )}
    </div>
  );
};
