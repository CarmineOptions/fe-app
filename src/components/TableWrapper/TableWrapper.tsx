import { Box, TableContainer } from "@mui/material";
import { ReactNode } from "react";

type TableWrapperProps = {
  slippage?: boolean;
  children: ReactNode;
};

export const TableWrapper = (props: TableWrapperProps) => {
  const { children } = props;
  return <TableContainer component={Box}>{children}</TableContainer>;
};
