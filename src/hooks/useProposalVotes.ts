import { useQuery } from "react-query";
import { QueryKeys } from "../queries/keys";
import { queryProposalVotes } from "../calls/getProposalVotes";

export const useProposalVotes = (propId: number) => {
  const key = `${QueryKeys.proposalVotes}-${propId}`;

  return useQuery([key, propId], queryProposalVotes);
};
