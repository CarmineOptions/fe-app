import { Dialog, Tooltip } from "@mui/material";
import { AccountInterface } from "starknet";

import { longInteger, shortInteger } from "../../utils/computations";
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
import { unstakeAirdrop } from "../../calls/carmineStake";

import styles from "./modal.module.css";
import buttonStyles from "../../style/button.module.css";

import GovernanceABI from "../../abi/governance_abi.json";
import TokenABI from "../../abi/lptoken_abi.json";

export const unstakeAndStake = async (
  account: AccountInterface,
  amount: bigint,
  length: number,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);

  const unstakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "unstake_airdrop",
    calldata: [],
  };
  const approveCall = {
    contractAddress: CRM_ADDRESS,
    entrypoint: "approve",
    calldata: [GOVERNANCE_ADDRESS, amount.toString(10), 0],
  };
  const stakeCall = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "stake",
    calldata: [length.toString(10), amount.toString(10)],
  };

  const res = await account
    .execute(
      [unstakeCall, approveCall, stakeCall],
      [GovernanceABI, TokenABI, GovernanceABI]
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
  amount: bigint;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const stateToClassName = (state: TransactionState) => {
  if (state === TransactionState.Success) {
    return buttonStyles.green;
  }
  if (state === TransactionState.Fail) {
    return buttonStyles.fail;
  }
  if (state === TransactionState.Processing) {
    return buttonStyles.disabled;
  }
  return buttonStyles.secondary;
};

export const StakingModal = ({ account, amount, open, setOpen }: Props) => {
  const numCarmBalance = shortInteger(amount, 18);
  const [inputValue, setInputValue] = useState(numCarmBalance.toString(10));
  const [selectedAmount, setSelectedAmount] = useState(amount);
  const [unstakeState, setUnstakeState] = useState(TransactionState.Initial);
  const [monthState, setMonthState] = useState(TransactionState.Initial);
  const [sixMonthsState, setSixMonthsState] = useState(
    TransactionState.Initial
  );
  const [yearState, setYearState] = useState(TransactionState.Initial);

  const handleClose = () => {
    setOpen(false);
    setUnstakeState(TransactionState.Initial);
    setMonthState(TransactionState.Initial);
    setSixMonthsState(TransactionState.Initial);
    setYearState(TransactionState.Initial);
  };

  const handleUnstake = () => unstakeAirdrop(account, setUnstakeState);

  const handle1month = () => {
    setSixMonthsState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    unstakeAndStake(
      account,
      selectedAmount,
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
      account,
      selectedAmount,
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
    unstakeAndStake(
      account,
      selectedAmount,
      CARMINE_STAKING_YEAR,
      setYearState
    ).then(() => {
      setMonthState(TransactionState.Initial);
      setSixMonthsState(TransactionState.Initial);
    });
  };

  const handleInputChange = (value: string) => {
    // Allow empty string, valid number, or a single decimal point followed by numbers
    const numericValue =
      value === "" || /^\d*\.?\d{0,6}$/.test(value) ? value : inputValue;

    const num = parseFloat(numericValue);
    const long = longInteger(num, 18);

    if (long > amount) {
      // cannot set more than holds
      return;
    }

    setInputValue(numericValue);
    setSelectedAmount(long);
  };

  const handleAll = () => {
    setInputValue(numCarmBalance.toString(10));
    setSelectedAmount(amount);
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
        <h1>Restake & Unstake</h1>
        <p>
          Your stake of {shortInteger(amount, 18)} <b>CRM</b> has expired.
        </p>
        <p>You can stake again for a period:</p>
        <div>
          <div className={styles.inputall}>
            <input
              placeholder="0"
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button onClick={handleAll}>All</button>
          </div>
          <div className={styles.buttongroup}>
            <Tooltip title="Staking for 1 month gives multiplier 1.0x">
              <button
                disabled={monthState !== TransactionState.Initial}
                onClick={handle1month}
                className={stateToClassName(monthState)}
              >
                {monthState === TransactionState.Processing && (
                  <LoadingAnimation />
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
                  <LoadingAnimation />
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
                  <LoadingAnimation />
                )}
                {yearState === TransactionState.Initial && "1 year"}
                {yearState === TransactionState.Success && "Done!"}
                {yearState === TransactionState.Fail && "Failed"}
              </button>
            </Tooltip>
          </div>
        </div>
        <p>
          Alternatively, you can unstake your <b>veCRM</b> to <b>CRM</b>:
        </p>
        <div className={styles.singlebutton}>
          <button
            disabled={unstakeState !== TransactionState.Initial}
            onClick={handleUnstake}
            className={stateToClassName(unstakeState)}
          >
            {unstakeState === TransactionState.Processing && (
              <LoadingAnimation />
            )}
            {unstakeState === TransactionState.Initial && "Unstake"}
            {unstakeState === TransactionState.Success && "Done!"}
            {unstakeState === TransactionState.Fail && "Failed"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
