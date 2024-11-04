import { AccountInterface } from "starknet";
import { GOVERNANCE_ADDRESS } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import { ProposalWithOpinion, UserVote } from "../../calls/liveProposals";
import { useState } from "react";
import { LoadingAnimation } from "../Loading/Loading";
import { addTx, markTxAsDone, showToast } from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { invalidateKey } from "../../queries/client";
import { TransactionAction } from "../../redux/reducers/transactions";
import { ToastType } from "../../redux/reducers/ui";

import styles from "./Vote.module.css";
import { QueryKeys } from "../../queries/keys";

enum Opinion {
  YAY = "1",
  NAY = "2",
}

const vote = async (
  account: AccountInterface,
  propId: number,
  opinion: Opinion,
  setProcessing: (b: boolean) => void
) => {
  setProcessing(true);

  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "vote",
    calldata: [propId, opinion],
  };

  const res = await account.execute(call).catch((e) => {
    debug("Vote rejected or failed", e.message);
  });

  if (!res) {
    setProcessing(false);
    return;
  }

  const hash = res.transaction_hash;

  addTx(hash, `vote-${propId}`, TransactionAction.Vote);
  afterTransaction(
    res.transaction_hash,
    () => {
      invalidateKey(`proposals-${account?.address}`);
      invalidateKey(`${QueryKeys.proposalVotes}-${propId}`);
      setProcessing(false);
      showToast(`Successfully voted on proposal ${propId}`, ToastType.Success);
      markTxAsDone(hash);
    },
    () => {
      setProcessing(false);
      showToast(`Vote on proposal ${propId} failed`, ToastType.Error);
      markTxAsDone(hash);
    }
  );
};

type VoteButtonsProps = {
  account?: AccountInterface;
  proposal: ProposalWithOpinion;
  balance?: bigint;
};

export const VoteButtons = ({
  account,
  proposal,
  balance,
}: VoteButtonsProps) => {
  const [processing, setProcessing] = useState(false);

  if (processing) {
    return (
      <div className={styles.votebuttoncontainer}>
        <div className={styles.loading}>
          <LoadingAnimation size={20} />
        </div>
      </div>
    );
  }
  if (!account) {
    return <p>Connect wallet to vote</p>;
  }
  if (!balance) {
    return <p>Only Carmine Token holders can vote</p>;
  }
  if (proposal.opinion === UserVote.NotVoted) {
    return (
      <div className={styles.votebuttoncontainer}>
        <button
          className="primary active"
          onClick={() =>
            vote(account, proposal.propId, Opinion.YAY, setProcessing)
          }
        >
          Vote Yes
        </button>
        <button
          className="primary active"
          onClick={() =>
            vote(account, proposal.propId, Opinion.NAY, setProcessing)
          }
        >
          Vote No
        </button>
      </div>
    );
  }

  const message =
    proposal.opinion === UserVote.Yay
      ? "Already voted Yes ✅"
      : "Already voted No ❌";

  return (
    <div className={styles.votebuttoncontainer + " " + styles.center}>
      <button disabled className="green">
        {message}
      </button>
    </div>
  );
};
