import { ProposalItem } from "./ProposalItem";
import styles from "./Proposal.module.css";
import { LoadingAnimation } from "../Loading/Loading";
import { ProposalWithOpinion } from "../../calls/liveProposals";
import { AccountInterface } from "starknet";

type Props = {
  proposals: ProposalWithOpinion[];
  balance?: bigint;
  account?: AccountInterface;
};

const ProposalTable = ({ proposals, balance, account }: Props) => {
  if (balance === undefined) {
    return <LoadingAnimation />;
  }

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
