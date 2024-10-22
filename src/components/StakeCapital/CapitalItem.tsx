import { TableCell, TableRow } from "@mui/material";
import { useQuery } from "react-query";

import { Pool } from "../../classes/Pool";
import { QueryKeys } from "../../queries/keys";
import { fetchStakeCapital } from "./fetchStakeCapital";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./CapitalItem.module.css";

type Props = {
  pool: Pool;
};

export const CapitalItemContent = ({ pool }: Props) => {
  const { data, isLoading, isError } = useQuery(
    [QueryKeys.stake, pool],
    fetchStakeCapital
  );

  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <LoadingAnimation size={20} />
      </div>
    );
  }

  if (isError || !data.data) {
    return <p>Failed fetching data.</p>;
  }

  const precission = 4;
  const biDigits = BigInt(pool.digits - precission);

  const unlocked =
    Number(BigInt(data.data.unlocked_cap) / 10n ** biDigits) / 10 ** precission;
  const locked =
    Number(BigInt(data.data.locked_cap) / 10n ** biDigits) / 10 ** precission;

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
