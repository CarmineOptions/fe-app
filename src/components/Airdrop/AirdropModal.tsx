import { Dialog, Tooltip } from "@mui/material";
import { AccountInterface } from "starknet";
import { Eligible } from "./getProof";

import { shortInteger } from "../../utils/computations";
import {
  CARMINE_STAKING_MONTH,
  CARMINE_STAKING_YEAR,
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
} from "../../constants/amm";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { TransactionAction } from "../../redux/reducers/transactions";
import { ToastType } from "../../redux/reducers/ui";
import { useState } from "react";
import { TransactionState, TxTracking } from "../../types/network";
import { LoadingAnimation } from "../Loading/Loading";
import GovernanceABI from "../../abi/governance_abi.json";
import TokenABI from "../../abi/lptoken_abi.json";
import { invalidateKey } from "../../queries/client";
import { QueryKeys } from "../../queries/keys";

import styles from "./airdrop.module.css";

export const claim = async (
  account: AccountInterface,
  data: string[],
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);
  const [address, amount, ...proof] = data;

  // calldata structure explained here: https://github.com/CarmineOptions/carmine-api/tree/master/carmine-api-airdrop
  // in Cairo, to send array you need to insert the length of array before the array items - "String(proof.length)"
  const calldata = [address, amount, String(proof.length), ...proof];
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "claim",
    calldata,
  };
  const res = await account.execute(call, [GovernanceABI]).catch(() => null);

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, "airdrop-claim", TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        showToast("Successfully claimed airdrop", ToastType.Success);
        markTxAsDone(hash);
        invalidateKey(QueryKeys.airdropData);
      },
      () => {
        setTxState(TransactionState.Fail);
        showToast("Failed claiming airdrop", ToastType.Error);
        markTxAsFailed(hash);
      }
    );
  } else {
    setTxState(TransactionState.Fail);
    showToast("Failed claiming airdrop", ToastType.Error);
  }
};

export const claimAndStake = async (
  account: AccountInterface,
  data: string[],
  airdropAmount: bigint,
  length: number,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);
  const [address, amount, ...proof] = data;

  // calldata structure explained here: https://github.com/CarmineOptions/carmine-api/tree/master/carmine-api-airdrop
  // in Cairo, to send array you need to insert the length of array before the array items - "String(proof.length)"
  const claimCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "claim",
    calldata: [address, amount, String(proof.length), ...proof],
  };
  const unstakeAirdropCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake_airdrop",
    calldata: [],
  };
  const approveCall = {
    contractAddress: CRM_ADDRESS,
    entrypoint: "approve",
    calldata: [GOVERNANCE_ADDRESS, airdropAmount.toString(10), 0],
  };
  const stakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "stake",
    calldata: [length, airdropAmount.toString(10)],
  };

  const res = await account
    .execute(
      [claimCall, unstakeAirdropCall, approveCall, stakeCall],
      [GovernanceABI, GovernanceABI, TokenABI, GovernanceABI]
    )
    .catch(() => null);

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, `airdrop-stake-${length}`, TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        showToast("Successfully claimed and staked airdrop", ToastType.Success);
        markTxAsDone(hash);
      },
      () => {
        setTxState(TransactionState.Fail);
        showToast("Failed claiming airdrop", ToastType.Error);
        markTxAsFailed(hash);
      }
    );
  } else {
    setTxState(TransactionState.Fail);
    showToast("Failed claiming airdrop", ToastType.Error);
  }
};

type Props = {
  account: AccountInterface;
  data: Eligible;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const stateToClassName = (state: TransactionState) => {
  if (state === TransactionState.Success) {
    return "mainbutton active green";
  }
  if (state === TransactionState.Fail) {
    return "mainbutton active red";
  }
  if (state === TransactionState.Processing) {
    return "mainbutton active disabled";
  }
  return "mainbutton active primary";
};

export const AirdropModal = ({ account, data, open, setOpen }: Props) => {
  const [claimState, setClaimState] = useState(TransactionState.Initial);
  const [monthState, setMonthState] = useState(TransactionState.Initial);
  const [sixMonthsState, setSixMonthsState] = useState(
    TransactionState.Initial
  );
  const [yearState, setYearState] = useState(TransactionState.Initial);

  const handleClose = () => {
    setOpen(false);
    setClaimState(TransactionState.Initial);
    setMonthState(TransactionState.Initial);
    setSixMonthsState(TransactionState.Initial);
    setYearState(TransactionState.Initial);
  };

  const handleClaim = () => claim(account, data.proof, setClaimState);

  const handle1month = () => {
    setSixMonthsState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    claimAndStake(
      account,
      data.proof,
      data.claimable,
      CARMINE_STAKING_MONTH,
      setMonthState
    ).then(() => {
      setSixMonthsState(TransactionState.Initial);
      setYearState(TransactionState.Initial);
    });
  };
  const handle6months = () => {
    setMonthState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    claimAndStake(
      account,
      data.proof,
      data.claimable,
      6 * CARMINE_STAKING_MONTH,
      setSixMonthsState
    ).then(() => {
      setMonthState(TransactionState.Initial);
      setYearState(TransactionState.Initial);
    });
  };
  const handleYear = () => {
    setMonthState(TransactionState.Processing);
    setSixMonthsState(TransactionState.Processing);
    claimAndStake(
      account,
      data.proof,
      data.claimable,
      CARMINE_STAKING_YEAR,
      setYearState
    ).then(() => {
      setMonthState(TransactionState.Initial);
      setSixMonthsState(TransactionState.Initial);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="claim-airdrop"
      aria-describedby="claim-airdrop-modal"
      PaperProps={{ sx: { borderRadius: 0, background: "none" } }}
    >
      <div className={styles.modal}>
        <h1>Claim Airdrop</h1>
        <p>
          Congratulations! You are eligible to claim{" "}
          {shortInteger(data.claimable, 18)} <b>veCRM</b>!
        </p>
        <p>You can claim and stake for any of these periods:</p>
        <div className={styles.buttongroup}>
          <Tooltip title="Staking for 1 month gives multiplier 1.0x">
            <button
              disabled={monthState !== TransactionState.Initial}
              onClick={handle1month}
              className={stateToClassName(monthState)}
            >
              {monthState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {monthState === TransactionState.Initial && "1 month"}
              {monthState === TransactionState.Success && "Done!"}
              {monthState === TransactionState.Fail && "Failed"}
            </button>
          </Tooltip>
          <Tooltip title="Staking for 6 months gives multiplier 1.6x">
            <button
              disabled={sixMonthsState !== TransactionState.Initial}
              onClick={handle6months}
              className={stateToClassName(sixMonthsState)}
            >
              {sixMonthsState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {sixMonthsState === TransactionState.Initial && "6 months"}
              {sixMonthsState === TransactionState.Success && "Done!"}
              {sixMonthsState === TransactionState.Fail && "Failed"}
            </button>
          </Tooltip>
          <Tooltip title="Staking for 1 year gives multiplier 2.5x">
            <button
              disabled={yearState !== TransactionState.Initial}
              onClick={handleYear}
              className={stateToClassName(yearState)}
            >
              {yearState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {yearState === TransactionState.Initial && "1 year"}
              {yearState === TransactionState.Success && "Done!"}
              {yearState === TransactionState.Fail && "Failed"}
            </button>
          </Tooltip>
        </div>
        <p>Alternatively you can claim without staking:</p>
        <div className={styles.singlebutton}>
          <button
            disabled={claimState !== TransactionState.Initial}
            onClick={handleClaim}
            className={stateToClassName(claimState)}
          >
            {claimState === TransactionState.Processing && <LoadingAnimation />}
            {claimState === TransactionState.Initial && "Claim"}
            {claimState === TransactionState.Success && "Done!"}
            {claimState === TransactionState.Fail && "Failed"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
