import { Info } from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { Pool } from "../../classes/Pool";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../../constants/amm";
import { useAccount } from "@starknet-react/core";
import tableStyles from "../../style/table.module.css";
import { OptionType } from "../../types/options";
import { timestampToReadableDate } from "../../utils/utils";
import { StakeCapitalItem } from "./StakeItem";
import { useEffect, useState } from "react";
import { apiUrl } from "../../api";
import { debug } from "../../utils/debugger";

const POOLS = [
  new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Put),
  new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Call),
  new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Put),
  new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Put),
  new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Put),
];

const getDefispringApy = async (setDefispringApy: (n: number) => void) => {
  fetch(apiUrl("defispring", { version: 1, network: "mainnet" }))
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success" && result?.data?.apy) {
        setDefispringApy(result.data.apy * 100);
      }
    })
    .catch((e) => debug(e));
};

export const StakeCapitalParent = () => {
  const { account } = useAccount();
  const [defispringApy, setDefispringApy] = useState<number | undefined>();

  useEffect(() => {
    getDefispringApy(setDefispringApy);
  }, []);

  const MAINNET_LAUNCH_TIMESTAMP = 1705078858000; // new AMM launch
  const yslTooltipText = `Annual Percentage Yield calculated from the launch to Mainnet on ${timestampToReadableDate(
    MAINNET_LAUNCH_TIMESTAMP
  )}.`;
  const apyTooltipText =
    "APY (Annual Percentage Yield) is calculated based on the last week and represents the annualized yield of the pool. Keep in mind that it does NOT account for risk and that past returns do not imply future returns.";

  return (
    <Table aria-label="simple table" className={tableStyles.table}>
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography>Pool</Typography>
          </TableCell>
          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            <Tooltip title={yslTooltipText}>
              <Typography>APY all time</Typography>
            </Tooltip>
          </TableCell>
          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
            <RouterLink
              style={{ textDecoration: "none", color: "inherit" }}
              to="/apy-info"
            >
              <Tooltip title={apyTooltipText}>
                <Typography>
                  APY last week
                  <Info sx={{ height: "17px", marginBottom: "-2px" }} />
                </Typography>
              </Tooltip>
            </RouterLink>
          </TableCell>

          <TableCell align="center">
            <Typography>Amount</Typography>
          </TableCell>
          <TableCell align="center"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {POOLS.map((pool, i) => (
          <StakeCapitalItem
            key={i}
            account={account}
            pool={pool}
            defispringApy={defispringApy}
          />
        ))}
      </TableBody>
    </Table>
  );
};
