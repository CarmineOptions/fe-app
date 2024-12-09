import { Call } from "starknet";
import {
  RequestResult,
  useAccount,
  useSendTransaction,
} from "@starknet-react/core";
import toast from "react-hot-toast";

import { GOVERNANCE_ADDRESS } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import { getUserOpinion, UserVote } from "../../calls/liveProposals";
import { useState } from "react";
import { LoadingAnimation } from "../Loading/Loading";
import { addTx, markTxAsDone } from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { invalidateKey } from "../../queries/client";
import { TransactionAction } from "../../redux/reducers/transactions";
import { QueryKeys } from "../../queries/keys";
import { useQuery } from "@tanstack/react-query";
import { Button, P3 } from "../common";

enum Opinion {
  YAY = "1",
  NAY = "2",
}

const vote = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  address: string | undefined,
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

  const res = await sendAsync([call]).catch((e) => {
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
      invalidateKey(`proposals-${address}`);
      invalidateKey(`${QueryKeys.proposalVotes}-${propId}`);
      setProcessing(false);
      toast.success(`Successfully voted on proposal ${propId}`);
      markTxAsDone(hash);
    },
    () => {
      setProcessing(false);
      toast.error(`Vote on proposal ${propId} failed`);
      markTxAsDone(hash);
    }
  );
};

type VoteButtonsProps = {
  id: number;
  balance?: bigint;
};

export const VoteButtons = ({ id, balance }: VoteButtonsProps) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const [processing, setProcessing] = useState(false);
  const {
    isLoading,
    isError,
    data: opinion,
  } = useQuery({
    queryKey: ["user-opinion", address, id],
    queryFn: async () => getUserOpinion(address!, id),
    enabled: !!address,
  });

  const handleClick = (opinion: Opinion) =>
    vote(sendAsync, address, id, opinion, setProcessing);

  if (!address || !balance) {
    return null;
  }

  if (processing || isLoading) {
    return (
      <div className="flex justify-center items-center h-8">
        <LoadingAnimation size={20} />
      </div>
    );
  }

  if (isError || opinion === undefined) {
    return (
      <div className="flex justify-between pt-4 w-64">
        <div className="flex items-center justify-center w-60">
          <P3>Something went wrong</P3>
        </div>
      </div>
    );
  }

  if (opinion === UserVote.NotVoted) {
    // show voting buttons
    return (
      <div className="flex justify-between">
        <Button
          type="primary"
          className="h-8 w-28"
          onClick={() => handleClick(Opinion.YAY)}
        >
          Vote Yes
        </Button>
        <Button
          type="primary"
          className="h-8 w-28"
          onClick={() => handleClick(Opinion.NAY)}
        >
          Vote No
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <Button
        disabled
        type={opinion === UserVote.Yay ? "success" : "dark"}
        className="h-8 w-28"
      >
        Voted Yes
      </Button>
      <Button
        disabled
        type={opinion === UserVote.Nay ? "success" : "dark"}
        className="h-8 w-28"
      >
        Voted No
      </Button>
    </div>
  );
};
