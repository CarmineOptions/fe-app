import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { LoadingAnimation } from "../Loading/Loading";
import { isNonEmptyArray } from "../../utils/utils";
import { WithdrawItem } from "./WithdrawItem";
import { NoContent } from "../TableNoContent";
import { fetchCapital } from "./fetchCapital";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "@starknet-react/core";
import tableStyles from "../../style/table.module.css";

type Props = { address: string };

const WithdrawParentWithAccount = ({ address }: Props) => {
  const { isLoading, isError, isFetching, data } = useQuery({
    queryKey: [QueryKeys.stake, address],
    queryFn: async () => fetchCapital(address),
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <Box sx={{ padding: "20px" }}>
        <LoadingAnimation size={40} />
      </Box>
    );
  }

  if (isError)
    return <NoContent text="Something went wrong, please try again later" />;

  if (!isNonEmptyArray(data))
    return <NoContent text="You currently do not have any staked capital" />;

  return (
    <Table aria-label="simple table" className={tableStyles.table}>
      <TableHead>
        <TableRow>
          <TableCell>Pool</TableCell>
          <TableCell>Value of stake</TableCell>
          <TableCell>Amount to unstake</TableCell>
          <TableCell align="right">
            {isFetching && <LoadingAnimation size={30} />}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((userPoolInfo, i) => (
          <WithdrawItem key={i} userPoolInfo={userPoolInfo} />
        ))}
      </TableBody>
    </Table>
  );
};

export const WithdrawParent = () => {
  const { address } = useAccount();

  if (!address)
    return <NoContent text="Connect wallet to see your staked capital" />;

  return <WithdrawParentWithAccount address={address} />;
};
