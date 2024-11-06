import { Call } from "starknet";
import { useState } from "react";
import { Tooltip } from "@mui/material";

import { longInteger, shortInteger } from "../../utils/computations";
import {
  CARMINE_STAKING_MONTH,
  CARMINE_STAKING_YEAR,
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
} from "../../constants/amm";
import { TransactionState, TxTracking } from "../../types/network";
import { stateToClassName } from "./StakingModal";
import { LoadingAnimation } from "../Loading/Loading";
import { TransactionAction } from "../../redux/reducers/transactions";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { ToastType } from "../../redux/reducers/ui";
import { invalidateKey } from "../../queries/client";
import { QueryKeys } from "../../queries/keys";

import styles from "./vest.module.css";
import { RequestResult, useSendTransaction } from "@starknet-react/core";

type Props = {
  carmBalance: bigint;
};

const stake = async (
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>,
  amount: bigint,
  length: number,
  setTxState: TxTracking
) => {
  setTxState(TransactionState.Processing);

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

  const res = await sendAsync([approveCall, stakeCall]).catch(() => null);

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, `stake-${length}`, TransactionAction.ClaimAirdrop);
    afterTransaction(
      res.transaction_hash,
      () => {
        setTxState(TransactionState.Success);
        showToast("Successfully claimed and staked airdrop", ToastType.Success);
        markTxAsDone(hash);
        // success, refetch new CRM balance
        invalidateKey(QueryKeys.carmineStakes);
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

export const StakeCrm = ({ carmBalance }: Props) => {
  const { sendAsync } = useSendTransaction({});
  const [inputValue, setInputValue] = useState("");
  const [amount, setSelectedAmount] = useState(0n);

  const [monthState, setMonthState] = useState(TransactionState.Initial);
  const [sixMonthsState, setSixMonthsState] = useState(
    TransactionState.Initial
  );
  const [yearState, setYearState] = useState(TransactionState.Initial);

  const numCarmBalance = shortInteger(carmBalance, 18);

  const handle1month = () => {
    setSixMonthsState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    stake(sendAsync, amount, CARMINE_STAKING_MONTH, setMonthState).then(() => {
      setSixMonthsState(TransactionState.Initial);
      setYearState(TransactionState.Initial);
    });
  };
  const handle6months = () => {
    setMonthState(TransactionState.Processing);
    setYearState(TransactionState.Processing);
    stake(sendAsync, amount, 6 * CARMINE_STAKING_MONTH, setSixMonthsState).then(
      () => {
        setMonthState(TransactionState.Initial);
        setYearState(TransactionState.Initial);
      }
    );
  };
  const handleYear = () => {
    setMonthState(TransactionState.Processing);
    setSixMonthsState(TransactionState.Processing);
    stake(sendAsync, amount, CARMINE_STAKING_YEAR, setYearState).then(() => {
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

    if (long > carmBalance) {
      // cannot set more than holds
      return;
    }

    setInputValue(numericValue);
    setSelectedAmount(long);
  };

  const handleAll = () => {
    setInputValue(numCarmBalance.toString(10));
    setSelectedAmount(carmBalance);
  };

  return (
    <div>
      <p>
        Stake your <b>CRM</b> for a period
      </p>
      <div className={styles.container + " topmargin botmargin"}>
        <div className={styles.inputall}>
          <input
            placeholder="0"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <button onClick={handleAll}>All</button>
        </div>
        <div className={styles.buttons}>
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
      </div>
    </div>
  );
};
