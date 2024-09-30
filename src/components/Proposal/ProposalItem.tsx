import { AccountInterface } from "starknet";
import { VoteButtons } from "../Vote/Vote";
import { ProposalWithOpinion } from "../../calls/liveProposals";
import { useProposalVotes } from "../../hooks/useProposalVotes";
import { ProposalVotes } from "../../calls/getProposalVotes";

import styles from "./Proposal.module.css";
import { Tooltip } from "@mui/material";

type Props = {
  proposal: ProposalWithOpinion;
  balance?: bigint;
  account?: AccountInterface;
};

const VoteScore = ({ proposalVotes }: { proposalVotes: ProposalVotes }) => {
  const { yay, nay } = proposalVotes;

  const total = yay + nay;
  const yayPercentage = (yay / total) * 100;
  const nayPercentage = (nay / total) * 100;

  return (
    <div className={styles.yaynaycontainer}>
      <div className={styles.yaynaybox}>
        <Tooltip title={yay}>
          <div>
            <p>✅ {yayPercentage.toFixed(1)}%</p>
          </div>
        </Tooltip>
        <Tooltip title={nay}>
          <div>
            <p>{nayPercentage.toFixed(1)}% ❌</p>
          </div>
        </Tooltip>
      </div>
      <div className={styles.percentagebar}>
        <div className={styles.yay} style={{ width: `${yayPercentage}%` }} />
        <div className={styles.nay} style={{ width: `${nayPercentage}%` }} />
      </div>
    </div>
  );
};

export const ProposalItem = ({ proposal, balance, account }: Props) => {
  const { data } = useProposalVotes(proposal.propId);

  return (
    <div>
      <h3>Proposal #{proposal.propId}</h3>
      {data && <VoteScore proposalVotes={data} />}
      <div>
        <VoteButtons proposal={proposal} balance={balance} account={account} />
      </div>
    </div>
  );
};
