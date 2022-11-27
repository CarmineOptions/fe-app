import { isNonEmptyArray } from "../../utils/utils";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { Cached } from "@mui/icons-material";
import { useAccount } from "@starknet-react/core";
import { useEffect, useReducer, useState } from "react";
import { PositionItem } from "./PositionItem";
import { debug } from "../../utils/debugger";
import { LoadingAnimation } from "../loading";
import { NoContent } from "../TableNoContent";

import { fetchPositions, initialState, reducer } from "./fetchPositions";

export const PositionTableComponent = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [refresh, toggleRefresh] = useState<boolean>(false);
  const { address, status } = useAccount();

  useEffect(() => {
    if (status === "connected" && address) {
      debug("Fetching positons");
      fetchPositions(address, dispatch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, refresh]);

  if (!address)
    return <NoContent text="Connect your wallet to see your positions." />;

  if (state.loading)
    return (
      <Box sx={{ padding: "20px" }}>
        <LoadingAnimation size={40} />
      </Box>
    );

  if (!isNonEmptyArray(state.data))
    return (
      <NoContent text="It seems you are not currently holding any positions." />
    );

  return (
    <Table sx={{ minWidth: 650 }} aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell>
            Option{" "}
            <Tooltip title="Refresh your position list">
              <Button onClick={() => toggleRefresh(!refresh)}>
                <Cached />
              </Button>
            </Tooltip>
          </TableCell>
          <TableCell align="right">Maturity</TableCell>
          <TableCell align="right">Size</TableCell>
          <TableCell align="right">Value</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell align="right"></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {state.data.map((o, i: number) => (
          <PositionItem option={o} key={i} />
        ))}
      </TableBody>
    </Table>
  );
};
