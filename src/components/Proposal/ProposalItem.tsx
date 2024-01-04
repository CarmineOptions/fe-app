import { Box, Typography } from "@mui/material";

import { Proposal } from "../../types/proposal";
import { Vote } from "../Vote/Vote";

type Props = {
  data: Proposal;
};

export const ProposalItem = ({ data }: Props) => (
  <Box>
    <Typography variant="h4">Proposal {data.id}</Typography>
    <Box>
      <Vote id={data.id} discordLink={data.discordLink} />
    </Box>
  </Box>
);
