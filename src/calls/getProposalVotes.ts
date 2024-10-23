import { GovernanceContract } from "../utils/blockchain";
import { shortInteger } from "../utils/computations";
import { debug } from "../utils/debugger";

type ProposalVotesResponse = {
  0: bigint;
  1: bigint;
};

export type ProposalVotes = {
  yay: number;
  nay: number;
};

export const fetchProposalVotes = async (
  propId: number
): Promise<ProposalVotes> => {
  const res = (await GovernanceContract.call("get_vote_counts", [propId]).catch(
    (e: Error) => {
      debug("Failed getting proposal votes", e.message);
      throw Error(e.message);
    }
  )) as ProposalVotesResponse;

  return { yay: shortInteger(res[0], 18), nay: shortInteger(res[1], 18) };
};
