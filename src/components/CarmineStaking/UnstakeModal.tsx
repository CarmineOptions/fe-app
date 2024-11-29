import { Dialog, Tooltip } from "@mui/material";
import { useState } from "react";
import { Call } from "starknet";
import { RequestResult, useSendTransaction } from "@starknet-react/core";
import toast from "react-hot-toast";

import {
  CARMINE_STAKING_MONTH,
  CARMINE_STAKING_YEAR,
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
} from "../../constants/amm";
import { addTx, markTxAsDone, markTxAsFailed } from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { TransactionAction } from "../../redux/reducers/transactions";
import { TransactionState, TxTracking } from "../../types/network";
import { LoadingAnimation } from "../Loading/Loading";
import { unstake } from "../../calls/carmineStake";
import { CarmineStake } from "../../classes/CarmineStake";

import { Button, H5 } from "../common";
import { formatNumber, stateToButtonType } from "../../utils/utils";

// eslint-disable-next-line react-refresh/only-export-components
export const unstakeAndStake = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  stake: CarmineStake,
  length: number,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);

  const unstakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake",
    calldata: [stake.id],
  };
  const approveCall = {
    contractAddress: CRM_ADDRESS,
    entrypoint: "approve",
    calldata: [GOVERNANCE_ADDRESS, stake.amountStaked.toString(10), 0],
  };
  const stakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "stake",
    calldata: [length.toString(10), stake.amountStaked.toString(10)],
  };

  const res = await sendAsync([unstakeCall, approveCall, stakeCall]).catch(
    () => null
  );

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, `restake-stake-${length}`, TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        toast.success("Successfully restaked");
        markTxAsDone(hash);
      },
      () => {
        setTxState(TransactionState.Fail);
        toast.error("Failed restaking");
        markTxAsFailed(hash);
      }
    );
  } else {
    setTxState(TransactionState.Fail);
    toast.error("Failed restaking");
  }
};

type Props = {
  stake: CarmineStake;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const UnstakeModal = ({ stake, open, setOpen }: Props) => {
  const [unstakeState, setUnstakeState] = useState(TransactionState.Initial);
  const [monthState, setMonthState] = useState(TransactionState.Initial);
  const [sixMonthsState, setSixMonthsState] = useState(
    TransactionState.Initial
  );
  const [yearState, setYearState] = useState(TransactionState.Initial);
  const { sendAsync } = useSendTransaction({
    calls: undefined,
  });

  const handleClose = () => {
    setOpen(false);
    setUnstakeState(TransactionState.Initial);
    setMonthState(TransactionState.Initial);
    setSixMonthsState(TransactionState.Initial);
    setYearState(TransactionState.Initial);
  };

  const handleUnstake = () => unstake(sendAsync, stake, setUnstakeState);

  const handle1month = () => {
    setSixMonthsState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    unstakeAndStake(
      sendAsync,
      stake,
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
    unstakeAndStake(
      sendAsync,
      stake,
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
    unstakeAndStake(sendAsync, stake, CARMINE_STAKING_YEAR, setYearState).then(
      () => {
        setMonthState(TransactionState.Initial);
        setSixMonthsState(TransactionState.Initial);
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="unstake-crm"
      aria-describedby="unstake-crm-modal"
      PaperProps={{ sx: { borderRadius: 0, background: "none" } }}
    >
      <div className="w-64 sm:w-[500px] bg-dark-card border-dark-primary text-dark-primary border-[1px] p-6 flex flex-col gap-4">
        <H5>Restake & Unstake</H5>
        <p>
          Your stake of {formatNumber(stake.amountStakedHumanReadable)}{" "}
          <b>CRM</b> has expired.
        </p>
        <p>You can stake again for a period.</p>
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
        Alternatively, you can unstake your <b>veCRM</b> to <b>CRM</b>:
        <div className="align-middle m-auto">
          <Button
            type={stateToButtonType(unstakeState)}
            disabled={unstakeState !== TransactionState.Initial}
            onClick={handleUnstake}
            className="w-40 h-8"
          >
            {unstakeState === TransactionState.Processing && (
              <LoadingAnimation size={20} />
            )}
            {unstakeState === TransactionState.Initial && "Unstake"}
            {unstakeState === TransactionState.Success && "Done!"}
            {unstakeState === TransactionState.Fail && "Failed"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
