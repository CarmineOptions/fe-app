import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { PairBadge, TokenNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { setSidebarContent } from "../../redux/actions";
import { PoolSidebarSuccess } from "./PoolSidebarSuccess";
import { TransactionState } from "../../types/network";
import { useStakes } from "../../hooks/useStakes";
import { handleDeposit, handleWithdraw } from "../Yield/handleAction";
import { formatNumber, formatTokenAmount } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { Button, Divider, H5, P3, P4 } from "../common";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { LiquidityPool } from "@carmine-options/sdk/core";
import {
  getPoolSnapshot,
  POOL_SNAPSHOT_DATE,
} from "../../constants/poolSnapshot";

type Props = {
  pool: LiquidityPool;
  initialAction?: "deposit" | "withdraw";
};

export const PoolSidebar = ({ pool, initialAction }: Props) => {
  const { address } = useAccount();
  const { sendAsync } = useSendTransaction({});
  const snapshot = getPoolSnapshot(pool.lpAddress);
  const { data: stakes } = useStakes();
  const { data: balanceRaw } = useUserBalance(pool.underlying.address);
  const [action, setAction] = useState<"deposit" | "withdraw">(
    initialAction === undefined ? "deposit" : initialAction
  );
  const [amount, setAmount] = useState<number>(0);
  const [amountText, setAmountText] = useState<string>("");
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.Initial
  );

  useEffect(() => {
    // sets default amounts when option changes
    setAmount(0);
    setAmountText("0");
    setTxState(TransactionState.Initial);
  }, [pool.poolId]);

  const unlocked = snapshot && snapshot.unlocked;
  const locked = snapshot && snapshot.locked;
  const tvl = snapshot && snapshot.tvl;
  const lpTokenValue = snapshot && snapshot.lpTokenValue;
  const balance =
    balanceRaw === undefined
      ? undefined
      : pool.underlying.toHumanReadable(balanceRaw);

  const poolData = stakes && stakes.find((p) => p.lpAddress === pool.lpAddress);

  const userPosition = stakes && poolData ? poolData.value : 0;

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      if (
        txState === TransactionState.Fail ||
        txState === TransactionState.Success
      ) {
        setTxState(TransactionState.Initial);
      }
      return n;
    }
  );
  const handleMax = () => {
    if (action === "deposit") {
      if (balance === undefined) {
        return;
      }
      setAmount(balance);
      setAmountText(balance.toString(10));
    }
    if (action === "withdraw") {
      if (userPosition === undefined) {
        return;
      }
      setAmount(userPosition);
      setAmountText(userPosition.toString(10));
    }
  };

  const handleActionClick = () => {
    if (action === "deposit" && address) {
      const done = (tx: string) => {
        setSidebarContent(
          <PoolSidebarSuccess pool={pool} deposited={amount} tx={tx} />
        );
      };
      handleDeposit(sendAsync, address, amount, pool, setTxState, done);
    }
    if (action === "withdraw" && address && poolData && userPosition) {
      if (userPosition < amount) {
        toast.error(
          `Cannot withdraw ${formatNumber(amount)}, you have ${formatNumber(
            userPosition
          )}`
        );
        setTxState(TransactionState.Fail);
        return;
      }
      handleWithdraw(sendAsync, amount, poolData, setTxState);
    }
  };

  return (
    <div className="bg-dark-card py-10 px-5 flex flex-col gap-7 h-full">
      <div className="flex items-center gap-2">
        <PairBadge tokenA={pool.base} tokenB={pool.quote} />
        <H5>
          {pool.base.symbol}/{pool.quote.symbol} {pool.isCall ? "Call" : "Put"}{" "}
          Pool
        </H5>
      </div>
      <div className="flex flex-col p-3 gap-6">
        <div className="flex gap-1">
          <Button
            outlined={action !== "deposit"}
            onClick={() => setAction("deposit")}
            className="normal-case"
          >
            Deposit
          </Button>
          <Button
            outlined={action !== "withdraw"}
            onClick={() => setAction("withdraw")}
            className="normal-case"
          >
            Withdraw
          </Button>
        </div>
        <div>
          <div className="flex border-dark-secondary border-[0.5px]">
            <div className="w-full flex flex-col justify-around p-3">
              <input
                placeholder="Enter amount"
                value={amountText}
                onChange={handleChange}
                className="w-full bg-[#1A1C1E]"
              />
            </div>
            <div className="bg-light-secondary flex items-center justify-center px-2">
              <TokenNamedBadge token={pool.underlying} size="small" />
            </div>
          </div>
          <div className="flex justify-end gap-1 items-center mt-1">
            <P4 className="text-dark-secondary">balance</P4>
            {action === "deposit" ? (
              <P4 className="text-dark-primary">
                {balance === undefined ? (
                  <LoadingAnimation size={12} />
                ) : (
                  formatNumber(balance)
                )}
              </P4>
            ) : (
              <P4 className="text-dark-primary">
                {userPosition === undefined ? (
                  <LoadingAnimation size={12} />
                ) : (
                  formatNumber(userPosition)
                )}
              </P4>
            )}
            <button
              className="text-[9px] text-dark bg-dark-primary rounded-sm px-1"
              onClick={handleMax}
            >
              MAX
            </button>
          </div>
        </div>

        {address === undefined ? (
          <PrimaryConnectWallet className="w-full" />
        ) : (
          <Button
            disabled={txState === TransactionState.Processing}
            onClick={handleActionClick}
            className="h-8 w-full"
            type={
              txState === TransactionState.Success
                ? "success"
                : txState === TransactionState.Fail
                ? "error"
                : "primary"
            }
          >
            {txState === TransactionState.Success ? (
              "Success!"
            ) : txState === TransactionState.Fail ? (
              "Error"
            ) : txState === TransactionState.Processing ? (
              <LoadingAnimation size={20} />
            ) : (
              action
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <P4 className="font-bold text-dark-tertiary">MY POSITION</P4>
          <Divider className="grow" />
        </div>

        <div className="flex flex-col items-start">
          <P3 className="font-semibold">
            {userPosition === undefined ? "--" : formatNumber(userPosition, 4)}{" "}
            {pool.underlying.symbol}
          </P3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <P4 className="font-bold text-dark-tertiary">POOL INFO</P4>
        <Divider className="grow" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div>
            <P4 className="font-semibold text-dark-secondary">
              LP TOKEN VALUE
            </P4>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {lpTokenValue === undefined
                ? "--"
                : `${formatNumber(lpTokenValue, 4)} ${pool.underlying.symbol}`}
            </P3>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <P4 className="font-semibold text-dark-secondary">TVL</P4>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {tvl === undefined
                ? "--"
                : `${formatTokenAmount(tvl)} ${pool.underlying.symbol}`}
            </P3>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <P4 className="font-semibold text-dark-secondary">UNLOCKED</P4>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {unlocked === undefined
                ? "--"
                : `${formatTokenAmount(unlocked)} ${pool.underlying.symbol}`}
            </P3>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <P4 className="font-semibold text-dark-secondary">LOCKED</P4>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {locked === undefined
                ? "--"
                : `${formatTokenAmount(locked)} ${pool.underlying.symbol}`}
            </P3>
          </div>
        </div>

        <P4 className="text-dark-tertiary">
          Pool numbers are a snapshot from {POOL_SNAPSHOT_DATE}. No new options
          are issued, so they no longer change. Your position is read live from
          the contract.
        </P4>
      </div>
    </div>
  );
};
