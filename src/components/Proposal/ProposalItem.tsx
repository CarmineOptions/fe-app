import { TableCell, TableRow } from "@mui/material";

import { Proposal } from "../../types/proposal";
import { Vote } from "../Vote/Vote";

type Props = {
  data: Proposal;
};

export const ProposalItem = ({data} : Props) => {
//   const handleClick = () => {
//     setCloseOption(option);
//     openCloseOptionDialog();
//   };

  return (
    <TableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>{data.discordLink}</TableCell>
      <TableCell align="right">
        <Vote />
      </TableCell>
    </TableRow>
  );
};
