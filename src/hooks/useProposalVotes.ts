import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { fetchProposalVotes } from "../calls/getProposalVotes";

export const useProposalVotes = (propId: number) => {
  return useQuery({
    queryKey: [QueryKeys.proposalVotes, propId],
    queryFn: () => fetchProposalVotes(propId),
  });
};
