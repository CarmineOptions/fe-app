import { Call } from "starknet";
import { useState } from "react";
import { Tooltip } from "@mui/material";
import { RequestResult, useSendTransaction } from "@starknet-react/core";
import toast from "react-hot-toast";

import { longInteger, shortInteger } from "../../utils/computations";
import {
  CARMINE_STAKING_MONTH,
  CARMINE_STAKING_YEAR,
  CRM_ADDRESS,
  GOVERNANCE_ADDRESS,
} from "../../constants/amm";
import { TransactionState, TxTracking } from "../../types/network";
import { LoadingAnimation } from "../Loading/Loading";
import { TransactionAction } from "../../redux/reducers/transactions";
import { addTx, markTxAsDone, markTxAsFailed } from "../../redux/actions";
import { afterTransaction } from "../../utils/blockchain";
import { invalidateKey } from "../../queries/client";
import { QueryKeys } from "../../queries/keys";
import { Button, P3 } from "../common";
import { stateToButtonType } from "../../utils/utils";

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
        toast.success("Successfully claimed and staked airdrop");
        markTxAsDone(hash);
        // success, refetch new CRM balance
        invalidateKey(QueryKeys.carmineStakes);
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
    <div className="flex flex-col max-w-[500px] gap-4">
      <P3>
        Stake your <span className="font-bold">CRM</span> for a period
      </P3>
      <div className="flex items-center border-dark-primary border-[1px] rounded-md">
        <input
          placeholder="0"
          type="text"
          value={inputValue}
          className="bg-dark text-dark-primary h-8 pl-2 w-2/3 rounded-md"
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <Button className="w-1/3 h-8" onClick={handleAll}>
          All
        </Button>
      </div>
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
    </div>
  );
};
