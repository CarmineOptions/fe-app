import { Call } from "starknet";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";
import { governanceContract } from "../constants/starknet";
import { CarmineStakeResult } from "../types/governance";
import { GOVERNANCE_ADDRESS } from "../constants/amm";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { afterTransaction } from "../utils/blockchain";
import { TransactionState, TxTracking } from "../types/network";
import { CarmineStake } from "../classes/CarmineStake";

const isEmptyStake = (stake: CarmineStakeResult): boolean => {
  if (stake.amount_staked === 0n && stake.start_date === 0n) {
    return true;
  }
  return false;
};

export const getStakes = async (address: string): Promise<CarmineStake[]> => {
  const increment = 5;
  const stakes = [];
  let lastId = 0;

  while (true) {
    const promises: { id: number; promise: Promise<CarmineStakeResult> }[] = [];
    for (let i = lastId; i < lastId + increment; i++) {
      promises.push({
        id: i,
        promise: governanceContract.get_stake(
          address,
          i
        ) as Promise<CarmineStakeResult>,
      });
    }
    const results = await Promise.all(promises.map((p) => p.promise));
    const values = results.map((result, index) => ({
      id: promises[index].id,
      result,
    }));

    stakes.push(...values.filter((v) => !isEmptyStake(v.result)));
    if (values.find((v) => isEmptyStake(v.result))) {
      break;
    }
    lastId += increment;
  }

  return stakes.map((s) => new CarmineStake({ ...s.result, id: s.id }));
};

export const stakeCarmineToken = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  length: bigint,
  amount: bigint,
  setState: TxTracking
) => {
  setState(TransactionState.Processing);
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "stake",
    calldata: [length, amount],
  };
  const res = await sendAsync([call]).catch(() => {
    toast.error("Failed to stake CRM");
    setState(TransactionState.Fail);
    return undefined;
  });

  if (!res) {
    return;
  }

  const { transaction_hash: hash } = res;

  addTx(hash, `stake-${hash}`, TransactionAction.TradeOpen);
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      toast.success("Successfully staked CRM");
      setState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      toast.error("Failed to stake CRM");
      setState(TransactionState.Fail);
    }
  );
};

export const claimAndStakeCarmineToken = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  claimData: string[],
  length: bigint,
  amount: bigint,
  setState: TxTracking
) => {
  setState(TransactionState.Processing);
  const [address, claimAmount, ...proof] = claimData;
  const claimCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "claim",
    calldata: [address, claimAmount, String(proof.length), ...proof],
  };
  const stakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "stake",
    calldata: [length, amount],
  };
  const res = await sendAsync([claimCall, stakeCall]).catch(() => {
    toast.error("Failed to claim & stake");
    setState(TransactionState.Fail);
    return undefined;
  });

  if (!res) {
    return;
  }

  const { transaction_hash: hash } = res;

  addTx(hash, `stake-${hash}`, TransactionAction.TradeOpen);
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      toast.success("Successfully claimed & staked CRM");
      setState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      toast.error("Failed to claim & stake CRM");
      setState(TransactionState.Fail);
    }
  );
};

export const unstakeAirdrop = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake_airdrop",
    calldata: [],
  };
  const res = await sendAsync([call]).catch(() => {
    toast.error("Failed to unstake");
    return undefined;
  });

  if (!res) {
    setTxState(TransactionState.Fail);
    return;
  }

  const { transaction_hash: hash } = res;

  addTx(hash, `unstake-${hash}`, TransactionAction.ClaimAirdrop);
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      toast.success("Successfully unstaked CRM");
      setTxState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      toast.error("Failed to unstake CRM");
      setTxState(TransactionState.Fail);
    }
  );
};

export const unstake = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  stake: CarmineStake,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake",
    calldata: [stake.id],
  };
  const res = await sendAsync([call]).catch(() => {
    toast.error("Failed to unstake");
    return undefined;
  });

  if (!res) {
    setTxState(TransactionState.Fail);
    return;
  }

  const { transaction_hash: hash } = res;

  addTx(hash, `unstake-${hash}`, TransactionAction.ClaimAirdrop);
  afterTransaction(
    hash,
    () => {
      markTxAsDone(hash);
      toast.success("Successfully unstaked CRM");
      setTxState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      toast.error("Failed to unstake CRM");
      setTxState(TransactionState.Fail);
    }
  );
};
