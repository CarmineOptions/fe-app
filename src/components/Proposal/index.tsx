import { Paper, useTheme } from "@mui/material";

import { isDarkTheme } from "../../utils/utils";
import { NoContent } from "../TableNoContent";
import { activeProposal } from "./fetchProposal";
import ProposalTable from "./ProposalTable";

// const data: Proposal[] =[];
const Content = () => {

  return (
    <>
      {activeProposal.length === 0 ? (
        <NoContent text="No proposals are currently live" />
      ) : (
        <ProposalTable activeData={activeProposal} />
      )}
    </>
  );
};
export const Proposals = () => {
  // const account = useAccount();
  const theme = useTheme();

//   if (!account) {
//     const child = () =>
//       NoContent({ text: "Connect your wallet to see your positions" });
//     return (
//       <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
//     );
//   }

  return(
  <Paper
    sx={{
      marginTop: 4,
      padding: 2,
      width: "100%",
      ...(isDarkTheme(theme) && {
        background: "#393946",
      }),
    }}
  >
    <Content/>
  </Paper>
  )};
