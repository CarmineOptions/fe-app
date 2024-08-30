import {
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties, useEffect, useState } from "react";
import { AccountInterface } from "starknet";
import { Pool } from "../../classes/Pool";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { handleStake } from "./handleStake";
import { CapitalItem } from "./CapitalItem";
import { apiUrl } from "../../api";
import { debug } from "../../utils/debugger";
import { TokenKey } from "../../classes/Token";
import { StarknetIcon } from "../Icons";
import { DefiSpringStakingMessage, DefiSpringTooltip } from "../DefiSpring";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

import stakeItemStyles from "./stakeitem.module.css";

type Props = {
  account: AccountInterface | undefined;
  pool: Pool;
  defispringApy?: number;
};

const getApy = async (
  setApy: ([n, m]: [number, number]) => void,
  pool: Pool
) => {
  fetch(apiUrl(`${pool.apiPoolId}/apy`, { version: 2 }))
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success" && result.data) {
        const { week_annualized, launch_annualized } = result.data;
        setApy([week_annualized, launch_annualized]);
      }
    })
    .catch((e) => debug(e));
};

const ShowApy = ({
  apy,
  defispringApy,
  isDefispringPool,
}: {
  apy?: number;
  defispringApy?: number;
  isDefispringPool: boolean;
}) => {
  const theme = useTheme();
  const MIN = -60;
  const MAX = 250;
  const sx: CSSProperties = { fontWeight: "bold", textAlign: "center" };

  if (apy === undefined || apy > MAX || apy < MIN) {
    return <Typography sx={sx}>--</Typography>;
  }

  // ignore defispring APY
  if (!isDefispringPool) {
    if (apy < 0) {
      sx.color = theme.palette.error.main;
    } else {
      sx.color = theme.palette.success.main;
    }

    return <Typography sx={sx}>{apy.toFixed(2)}%</Typography>;
  }

  if (defispringApy === undefined) {
    return <Typography sx={sx}>--</Typography>;
  }

  const apyWithDefispring = apy + defispringApy;

  if (apyWithDefispring < 0) {
    sx.color = theme.palette.error.main;
  } else {
    sx.color = theme.palette.success.main;
  }

  return (
    <DefiSpringTooltip
      title={
        <DefiSpringStakingMessage apy={apy} defispringApy={defispringApy} />
      }
    >
      <div className={stakeItemStyles.defiapycontainer}>
        <Typography sx={sx}>{apyWithDefispring.toFixed(2)}%</Typography>
        <StarknetIcon />
      </div>
    </DefiSpringTooltip>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ApyNotAvailable = () => {
  const sx: CSSProperties = { fontWeight: "bold", textAlign: "center" };

  return (
    <Tooltip title="This pool has not been active long enough to determine a reliable APY">
      <Typography sx={sx}>--</Typography>
    </Tooltip>
  );
};

export const StakeCapitalItem = ({ account, pool, defispringApy }: Props) => {
  const txPending = useTxPending(pool.poolId, TransactionAction.Stake);
  const [amount, setAmount] = useState<number>(0);
  const [showLockInfo, setLockInfo] = useState<boolean>(false);
  const [text, setText] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [apy, setApy] = useState<[number, number] | undefined>();

  useEffect(() => {
    getApy(setApy, pool);
  }, [pool]);

  const handleChange = handleNumericChangeFactory(setText, setAmount);

  const handleStakeClick = () =>
    handleStake(account!, amount, pool, setLoading);
  const handleLockedInfo = () => setLockInfo(!showLockInfo);

  const [weekly, sinceLaunch] = apy || [undefined, undefined];

  // not BTC pools
  const isDefispringPool =
    pool.baseToken.id !== TokenKey.BTC && pool.quoteToken.id !== TokenKey.BTC;

  return (
    <>
      <TableRow>
        <TableCell sx={{ whiteSpace: "nowrap" }} onClick={handleLockedInfo}>
          <Typography>{pool.name}</Typography>
        </TableCell>
        <TableCell onClick={handleLockedInfo}>
          <ShowApy
            apy={sinceLaunch}
            defispringApy={defispringApy}
            isDefispringPool={isDefispringPool}
          />
        </TableCell>
        <TableCell onClick={handleLockedInfo}>
          <ShowApy
            apy={weekly}
            defispringApy={defispringApy}
            isDefispringPool={isDefispringPool}
          />
        </TableCell>
        <TableCell sx={{ minWidth: "100px" }} align="center">
          <input type="text" value={text} onChange={handleChange} />
        </TableCell>
        <TableCell sx={{ display: "flex", alignItems: "center" }} align="right">
          {account ? (
            <button
              className={buttonStyles.secondary}
              disabled={loading || txPending}
              onClick={handleStakeClick}
            >
              {loading || txPending ? "Processing..." : "Stake"}
            </button>
          ) : (
            <button
              className={buttonStyles.secondary}
              onClick={openWalletConnectDialog}
            >
              Connect wallet
            </button>
          )}
        </TableCell>
      </TableRow>
      {showLockInfo && <CapitalItem pool={pool} />}
    </>
  );
};
