import { AccountInterface } from "starknet";
import { VoteButtons } from "../Vote/Vote";
import { ProposalWithOpinion } from "../../calls/liveProposals";

type Props = {
  proposal: ProposalWithOpinion;
  balance: bigint;
  account?: AccountInterface;
};

export const ProposalItem = ({ proposal, balance, account }: Props) => (
  <div>
    <h3>Proposal {proposal.propId}</h3>
    <div>
      <VoteButtons proposal={proposal} balance={balance} account={account} />
    </div>
  </div>
);
