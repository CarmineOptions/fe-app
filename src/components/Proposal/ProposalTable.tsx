import { ProposalItem } from "./ProposalItem";
import { ProposalWithOpinion } from "../../calls/liveProposals";

import styles from "./Proposal.module.css";

type Props = {
  proposals: ProposalWithOpinion[];
  balance?: bigint;
};

const ProposalTable = ({ proposals, balance }: Props) => {
  return (
    <div className={styles.listcontainer}>
      {proposals.map((item, i) => (
        <ProposalItem proposal={item} balance={balance} key={i} />
      ))}
    </div>
  );
};

export default ProposalTable;
