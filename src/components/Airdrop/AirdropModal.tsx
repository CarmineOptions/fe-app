import { Dialog, Tooltip } from "@mui/material";
import { Call } from "starknet";
import { RequestResult, useSendTransaction } from "@starknet-react/core";
import toast from "react-hot-toast";

import { Eligible } from "./getProof";
import { shortInteger } from "../../utils/computations";
import {
  CARMINE_STAKING_MONTH,
  CARMINE_STAKING_YEAR,
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
} from "../../constants/amm";
import { addTx, markTxAsDone, markTxAsFailed } from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { TransactionAction } from "../../redux/reducers/transactions";
import { useState } from "react";
import { TransactionState, TxTracking } from "../../types/network";
import { LoadingAnimation } from "../Loading/Loading";
import { invalidateKey } from "../../queries/client";
import { QueryKeys } from "../../queries/keys";
import { Button } from "../common";
import { stateToButtonType } from "../../utils/utils";

export const claim = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
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
  const res = await sendAsync([call]).catch((e) => {
    console.log("Failed claiming airdrop", e.message);
    console.error(e);
    return null;
  });

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, "airdrop-claim", TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        toast.success("Successfully claimed airdrop");
        markTxAsDone(hash);
        invalidateKey(QueryKeys.airdropData);
      },
      () => {
        setTxState(TransactionState.Fail);
        toast.error("Failed claiming airdrop");
        markTxAsFailed(hash);
      }
    );
  } else {
    setTxState(TransactionState.Fail);
    toast.error("Failed claiming airdrop");
  }
};

export const claimAndStake = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
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

  const res = await sendAsync([
    claimCall,
    unstakeAirdropCall,
    approveCall,
    stakeCall,
  ]).catch(() => null);

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, `airdrop-stake-${length}`, TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        toast.success("Successfully claimed and staked airdrop");
        markTxAsDone(hash);
      },
      () => {
        setTxState(TransactionState.Fail);
        toast.error("Failed claiming airdrop");
        markTxAsFailed(hash);
      }
    );
  } else {
    setTxState(TransactionState.Fail);
    toast.error("Failed claiming airdrop");
  }
};

type Props = {
  data: Eligible;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const AirdropModal = ({ data, open, setOpen }: Props) => {
  const { sendAsync } = useSendTransaction({});
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

  const handleClaim = () => claim(sendAsync, data.proof, setClaimState);

  const handle1month = () => {
    setSixMonthsState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    claimAndStake(
      sendAsync,
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
      sendAsync,
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
      sendAsync,
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
      <div className="bg-dark-card border-dark-primary text-dark-primary border-[1px] p-6 flex flex-col gap-4">
        <h1>Claim Airdrop</h1>
        <p>
          Congratulations! You are eligible to claim{" "}
          {shortInteger(data.claimable, 18)} <b>veCRM</b>!
        </p>
        <p>You can claim and stake for any of these periods:</p>
        <div className="flex flex-col sm:flex-row justify-around sm:items-center gap-2">
          <Tooltip title="Staking for 1 month gives multiplier 1.0x">
            <Button
              type={stateToButtonType(monthState)}
              disabled={monthState !== TransactionState.Initial}
              onClick={handle1month}
              className="w-full h-8"
            >
              {monthState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {monthState === TransactionState.Initial && "1 month"}
              {monthState === TransactionState.Success && "Done!"}
              {monthState === TransactionState.Fail && "Failed"}
            </Button>
          </Tooltip>
          <Tooltip title="Staking for 6 months gives multiplier 1.6x">
            <Button
              type={stateToButtonType(sixMonthsState)}
              disabled={sixMonthsState !== TransactionState.Initial}
              onClick={handle6months}
              className="w-full h-8"
            >
              {sixMonthsState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {sixMonthsState === TransactionState.Initial && "6 months"}
              {sixMonthsState === TransactionState.Success && "Done!"}
              {sixMonthsState === TransactionState.Fail && "Failed"}
            </Button>
          </Tooltip>
          <Tooltip title="Staking for 1 year gives multiplier 2.5x">
            <Button
              type={stateToButtonType(yearState)}
              disabled={yearState !== TransactionState.Initial}
              onClick={handleYear}
              className="w-full h-8"
            >
              {yearState === TransactionState.Processing && (
                <LoadingAnimation size={20} />
              )}
              {yearState === TransactionState.Initial && "1 year"}
              {yearState === TransactionState.Success && "Done!"}
              {yearState === TransactionState.Fail && "Failed"}
            </Button>
          </Tooltip>
        </div>
        <p>Alternatively you can claim without staking:</p>
        <div className="align-middle m-auto">
          <Button
            type={stateToButtonType(claimState)}
            disabled={claimState !== TransactionState.Initial}
            onClick={handleClaim}
            className="w-40 h-8"
          >
            {claimState === TransactionState.Processing && (
              <LoadingAnimation size={20} />
            )}
            {claimState === TransactionState.Initial && "Claim"}
            {claimState === TransactionState.Success && "Done!"}
            {claimState === TransactionState.Fail && "Failed"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
