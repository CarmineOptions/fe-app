import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import { Proposal } from "../../types/proposal";
import { ProposalItem } from "./ProposalItem";

type Props = {
  activeData: Proposal[];
  };
  
  const ProposalTable = ({ activeData }: Props) => {  
    return (
      <>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Discord Link</TableCell>
              <TableCell>Vote</TableCell>              
            </TableRow>
          </TableHead>
          <TableBody>
            {activeData
              .map((item: Proposal) => (
                <ProposalItem data={item} />
              ))}
          </TableBody>
        </Table>
      </>
    );
  };
  
  export default ProposalTable;
  