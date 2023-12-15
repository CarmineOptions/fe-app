import { Box } from "@mui/material";

import { Proposal } from "../../types/proposal";
import { ProposalItem } from "./ProposalItem";

type Props = {
  activeData: Proposal[];
};

const ProposalTable = ({ activeData }: Props) => {
  return (
    <Box>
      {activeData.map((item: Proposal) => (
        <ProposalItem data={item} />
      ))}
    </Box>
  );
};

export default ProposalTable;
