import { ProposalItem } from "./ProposalItem";
import styles from "./Proposal.module.css";
import { ProposalWithOpinion } from "../../calls/liveProposals";
import { AccountInterface } from "starknet";

type Props = {
  proposals: ProposalWithOpinion[];
  balance?: bigint;
  account?: AccountInterface;
};

const ProposalTable = ({ proposals, balance, account }: Props) => {
  return (
    <div className={styles.listcontainer}>
      {proposals.map((item, i) => (
        <ProposalItem
          proposal={item}
          account={account}
          balance={balance}
          key={i}
        />
      ))}
    </div>
  );
};

export default ProposalTable;
