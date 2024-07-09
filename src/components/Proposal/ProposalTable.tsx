import { ProposalItem } from "./ProposalItem";
import { useAccount } from "../../hooks/useAccount";
import styles from "./Proposal.module.css";
import { VE_CRM_ADDRESS } from "../../constants/amm";
import { useUserBalance } from "../../hooks/useUserBalance";
import { LoadingAnimation } from "../Loading/Loading";

type Props = {
  activeData: number[];
};

const ProposalTable = ({ activeData }: Props) => {
  const account = useAccount();
  const balance = useUserBalance(VE_CRM_ADDRESS);

  if (balance === undefined) {
    return <LoadingAnimation />;
  }

  return (
    <div className={styles.listcontainer}>
      {activeData.map((item, i) => (
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
