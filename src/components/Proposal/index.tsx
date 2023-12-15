import { Box } from "@mui/material";
import { NoContent } from "../TableNoContent";
import { activeProposal } from "./fetchProposal";
import ProposalTable from "./ProposalTable";

// const data: Proposal[] =[];
const Content = () => {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexFlow: "column",
        justifyContent: "center",
      }}
    >
      {activeProposal.length === 0 ? (
        <NoContent text="No proposals are currently live" />
      ) : (
        <ProposalTable activeData={activeProposal} />
      )}
    </Box>
  );
};
export const Proposals = () => {
  return <Content />;
};
