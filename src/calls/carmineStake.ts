import { AccountInterface } from "starknet";
import { governanceContract } from "../constants/starknet";
import { CarmineStakeResult } from "../types/governance";

import GovernanceABI from "../abi/governance_abi.json";
import { GOVERNANCE_ADDRESS } from "../constants/amm";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { afterTransaction } from "../utils/blockchain";
import { ToastType } from "../redux/reducers/ui";
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
    const promises = [];
    for (let i = lastId; i < lastId + increment; i++) {
      promises.push(governanceContract.get_stake(address, i));
    }
    const values = (await Promise.all(promises)) as CarmineStakeResult[];
    stakes.push(...values.filter((v) => !isEmptyStake(v)));
    if (values.find((v) => isEmptyStake(v))) {
      break;
    }
    lastId += increment;
  }

  return stakes.map((s) => new CarmineStake(s));
};

export const stakeCarmineToken = async (
  account: AccountInterface,
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
  const res = await account.execute(call, [GovernanceABI]).catch(() => {
    showToast("Failed to stake CRM", ToastType.Error);
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
      showToast("Successfully staked CRM", ToastType.Success);
      setState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      showToast("Failed to stake CRM", ToastType.Error);
      setState(TransactionState.Fail);
    }
  );
};

export const claimAndStakeCarmineToken = async (
  account: AccountInterface,
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
  const res = await account
    .execute([claimCall, stakeCall], [GovernanceABI])
    .catch(() => {
      showToast("Failed to claim & stake", ToastType.Error);
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
      showToast("Successfully claimed & staked CRM", ToastType.Success);
      setState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      showToast("Failed to claim & stake CRM", ToastType.Error);
      setState(TransactionState.Fail);
    }
  );
};

export const unstakeAirdrop = async (
  account: AccountInterface,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake_airdrop",
    calldata: [],
  };
  const res = await account.execute(call, [GovernanceABI]).catch(() => {
    showToast("Failed to unstake", ToastType.Error);
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
      showToast("Successfully unstaked CRM", ToastType.Success);
      setTxState(TransactionState.Success);
    },
    () => {
      markTxAsFailed(hash);
      showToast("Failed to unstake CRM", ToastType.Error);
      setTxState(TransactionState.Fail);
    }
  );
};
