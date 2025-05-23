import { GovernanceContract } from "../utils/blockchain";

export const fetchLiveProposals = async (): Promise<number[]> => {
  const res = (await GovernanceContract.call("get_live_proposals")) as bigint[];
  const proposals = res.map((bi: bigint) => Number(bi));

  return proposals;
};

export enum UserVote {
  Yay,
  Nay,
  NotVoted,
}

export type ProposalWithOpinion = {
  propId: number;
  opinion: UserVote;
};

export const fetchUserVotes = async (
  proposals: number[],
  userAddress?: string
): Promise<ProposalWithOpinion[]> => {
  if (!userAddress) {
    return proposals.map((propId) => ({ propId, opinion: UserVote.NotVoted }));
  }

  const promises = proposals.map((propId) =>
    GovernanceContract.call("get_user_voted", [userAddress, propId])
  );

  const res = (await Promise.all(promises)) as bigint[];

  const parsed = res.map((opinion) => {
    if (opinion === 1n) {
      return UserVote.Yay;
    }
    if (opinion === 0n) {
      return UserVote.NotVoted;
    }
    return UserVote.Nay;
  });

  return proposals.map((propId, index) => ({ propId, opinion: parsed[index] }));
};

export const fetchProposalsWithOpinions = async (
  address: string
): Promise<ProposalWithOpinion[]> => {
  const proposals = await fetchLiveProposals();
  return fetchUserVotes(proposals, address);
};

export const getUserOpinion = async (address: string, id: number) => {
  const res = await GovernanceContract.call("get_user_voted", [address, id]);

  if (res === 1n) {
    return UserVote.Yay;
  }
  if (res === 0n) {
    return UserVote.NotVoted;
  }
  return UserVote.Nay;
};
