import { TableCell, TableRow } from "@mui/material";

import { Pool } from "../../classes/Pool";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./CapitalItem.module.css";
import { usePoolState } from "../../hooks/usePoolState";

type Props = {
  pool: Pool;
};

export const CapitalItemContent = ({ pool }: Props) => {
  const { poolState, isLoading, isError } = usePoolState(pool);

  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <LoadingAnimation size={20} />
      </div>
    );
  }

  if (isError || !poolState) {
    return <p>Failed fetching data.</p>;
  }

  const precission = 4;
  const biDigits = BigInt(pool.digits - precission);

  const unlocked =
    Number(BigInt(poolState.unlocked_cap) / 10n ** biDigits) / 10 ** precission;
  const locked =
    Number(BigInt(poolState.locked_cap) / 10n ** biDigits) / 10 ** precission;

  return (
    <div className={styles.grid}>
      <span>Unlocked:</span>
      <span>
        {unlocked} {pool.symbol}
      </span>
      <span>Locked:</span>
      <span>
        {locked} {pool.symbol}
      </span>
    </div>
  );
};

export const CapitalItem = ({ pool }: Props) => {
  return (
    <TableRow>
      <TableCell>
        <CapitalItemContent pool={pool} />
      </TableCell>
    </TableRow>
  );
};
