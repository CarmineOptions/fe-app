import { AccountInterface } from "starknet";
import { Tooltip } from "@mui/material";

import { VoteButtons } from "../Vote/Vote";
import { ProposalWithOpinion } from "../../calls/liveProposals";
import { useProposalVotes } from "../../hooks/useProposalVotes";
import { ProposalVotes } from "../../calls/getProposalVotes";
import { useTotalSupply } from "../../hooks/useTotalSupply";
import { VE_CRM_ADDRESS } from "../../constants/amm";
import { shortInteger } from "../../utils/computations";
import { formatNumber } from "../../utils/utils";

import styles from "./Proposal.module.css";

type Props = {
  proposal: ProposalWithOpinion;
  balance?: bigint;
  account?: AccountInterface;
};

const VoteScore = ({
  proposalVotes,
  totalSupply,
}: {
  proposalVotes: ProposalVotes;
  totalSupply: number;
}) => {
  const { yay, nay } = proposalVotes;
  const notVotes = totalSupply - yay - nay;

  const yayPercentage = (yay / totalSupply) * 100;
  const nayPercentage = (nay / totalSupply) * 100;
  const notVotedPercentage = (notVotes / totalSupply) * 100;

  const votesMessage = (num: number, percentage: number) =>
    `${formatNumber(percentage)}%, ${formatNumber(num)} votes`;

  return (
    <div className={styles.yaynaycontainer}>
      <div className={styles.percentagebar}>
        <Tooltip title={votesMessage(yay, yayPercentage)}>
          <div className={styles.yay} style={{ width: `${yayPercentage}%` }} />
        </Tooltip>
        <Tooltip title={votesMessage(notVotes, notVotedPercentage)}>
          <div
            className={styles.non}
            style={{ width: `${notVotedPercentage}%` }}
          />
        </Tooltip>
        <Tooltip title={votesMessage(nay, nayPercentage)}>
          <div className={styles.nay} style={{ width: `${nayPercentage}%` }} />
        </Tooltip>
      </div>
    </div>
  );
};

export const ProposalItem = ({ proposal, balance, account }: Props) => {
  const { data: votes } = useProposalVotes(proposal.propId);
  const { data: totalSupplyRaw } = useTotalSupply(VE_CRM_ADDRESS);

  const totalSupply = totalSupplyRaw
    ? shortInteger(totalSupplyRaw, 18)
    : undefined;

  return (
    <div>
      <h3>Proposal #{proposal.propId}</h3>
      {votes !== undefined && totalSupply !== undefined && (
        <VoteScore proposalVotes={votes} totalSupply={totalSupply} />
      )}
      <div>
        <VoteButtons proposal={proposal} balance={balance} account={account} />
      </div>
    </div>
  );
};
