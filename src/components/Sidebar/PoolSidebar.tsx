import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Pool } from "../../classes/Pool";
import { PairBadge, TokenNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useCurrency } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { math64toDecimal } from "../../utils/units";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { setSidebarContent } from "../../redux/actions";
import { PoolSidebarSuccess } from "./PoolSidebarSuccess";
import { TransactionState } from "../../types/network";
import { useStakes } from "../../hooks/useStakes";
import { handleDeposit, handleWithdraw } from "../Yield/handleAction";
import { usePoolInfo } from "../../hooks/usePoolInfo";
import { formatNumber } from "../../utils/utils";
import { TokenKey } from "../../classes/Token";
import { LoadingAnimation } from "../Loading/Loading";
import { useDefispringApy } from "../../hooks/useDefyspringApy";
import { Button, Divider, H5, P3, P4 } from "../common";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { StarknetIcon } from "../Icons";

type Props = {
  pool: Pool;
  initialAction?: "deposit" | "withdraw";
};

export const PoolSidebar = ({ pool, initialAction }: Props) => {
  const { address } = useAccount();
  const { sendAsync } = useSendTransaction({});
  const { poolInfo } = usePoolInfo(pool);
  const { stakes } = useStakes();
  const price = useCurrency(pool.underlying.id);
  const { data: balanceRaw } = useUserBalance(pool.underlying.address);
  const [action, setAction] = useState<"deposit" | "withdraw">(
    initialAction === undefined ? "deposit" : initialAction
  );
  const [amount, setAmount] = useState<number>(0);
  const [amountText, setAmountText] = useState<string>("");
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.Initial
  );
  const { defispringApy } = useDefispringApy();

  useEffect(() => {
    // sets default amounts when option changes
    setAmount(0);
    setAmountText("0");
    setTxState(TransactionState.Initial);
  }, [pool.poolId]);

  const state = poolInfo?.state;
  const apy = poolInfo?.apy;
  const unlocked =
    state === undefined
      ? undefined
      : shortInteger(state.unlocked_cap, pool.underlying.decimals);
  const locked =
    state === undefined
      ? undefined
      : shortInteger(state.locked_cap, pool.underlying.decimals);
  const poolPosition =
    state === undefined ? undefined : math64toDecimal(state.pool_position);
  const tvl =
    unlocked === undefined || poolPosition === undefined
      ? undefined
      : unlocked + poolPosition;
  const balance =
    balanceRaw === undefined
      ? undefined
      : shortInteger(balanceRaw, pool.underlying.decimals);

  const poolData =
    stakes === undefined
      ? undefined
      : stakes.find((p) => p.lpAddress === pool.lpAddress);

  const userPosition =
    stakes === undefined
      ? undefined
      : poolData === undefined // got data and found nothing about this pool
      ? 0
      : poolData.value;

  const isDefispringPool =
    pool.baseToken.id !== TokenKey.BTC && pool.quoteToken.id !== TokenKey.BTC;
  const finalApy =
    apy === undefined
      ? undefined
      : !isDefispringPool
      ? apy.launch_annualized
      : defispringApy === undefined
      ? undefined
      : defispringApy + apy.launch_annualized;

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
        <PairBadge tokenA={pool.baseToken} tokenB={pool.quoteToken} />
        <H5>
          {pool.baseToken.symbol}/{pool.quoteToken.symbol} {pool.typeAsText}{" "}
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
              <P4 className="font-bold text-dark-secondary">
                {price === undefined
                  ? "$--"
                  : `$${formatNumber(price * amount)}`}
              </P4>
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
            {userPosition === undefined ? "--" : formatNumber(userPosition, 4)}
            {pool.underlying.symbol}
          </P3>
          <P4 className="text-dark-secondary">
            {userPosition === undefined || price === undefined
              ? "--"
              : `$${formatNumber(userPosition * price, 2)}`}
          </P4>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <P4 className="font-bold text-dark-tertiary">POOL INFO</P4>
        <Divider className="grow" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <P4 className="font-semibold text-dark-secondary">APY</P4>
          {finalApy === undefined ? (
            <P3 className="font-semibold">--</P3>
          ) : (
            <P3
              className={`font-semibold ${
                finalApy < 0 ? "text-ui-errorBg" : "text-ui-successBg"
              }`}
            >
              {finalApy.toFixed(2)}%
            </P3>
          )}
        </div>

        <div className="flex justify-between">
          <div>
            <P4 className="font-semibold text-dark-secondary">TVL</P4>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {tvl === undefined
                ? "--"
                : `${formatNumber(tvl, 0)} ${pool.underlying.symbol}`}
            </P3>
            <P4 className="text-dark-secondary">
              $
              {price === undefined || tvl === undefined
                ? "--"
                : formatNumber(price * tvl)}
            </P4>
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
                : `${formatNumber(unlocked, 0)} ${pool.underlying.symbol}`}
            </P3>
            <P4 className="text-dark-secondary">
              $
              {price === undefined || unlocked === undefined
                ? "--"
                : formatNumber(price * unlocked)}
            </P4>
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
                : `${formatNumber(locked, 0)} ${pool.underlying.symbol}`}
            </P3>
            <P4 className="text-dark-secondary">
              $
              {price === undefined || locked === undefined
                ? "--"
                : formatNumber(price * locked)}
            </P4>
          </div>
        </div>

        <div className="flex flex-col bg-light-secondary p-4 rounded-sm gap-4">
          <div className="flex justify-between">
            <div className="text-misc-starknet">
              <P3 className="font-semibold">Starknet DeFi</P3>
              <P3 className="font-semibold">Spring Incentive</P3>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-9 h-9">
                <StarknetIcon />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <P4 className="text-dark-secondary">Supply APY</P4>
              <P4 className="text-dark-primary">
                {apy === undefined
                  ? "--"
                  : formatNumber(apy.launch_annualized) + "%"}
              </P4>
            </div>
            <div className="flex justify-between">
              <P4 className="text-dark-secondary">STRK Incentive</P4>
              <P4 className="text-dark-primary">
                {defispringApy === undefined
                  ? "--"
                  : formatNumber(defispringApy) + "%"}
              </P4>
            </div>
            <div className="flex justify-between">
              <P4 className="text-dark-secondary">Total APY</P4>
              <P4
                className={`font-semibold ${
                  !finalApy
                    ? "text-ui-primary"
                    : finalApy < 0
                    ? "text-ui-errorBg"
                    : "text-ui-successBg"
                }`}
              >
                {finalApy === undefined ? "--" : formatNumber(finalApy) + "%"}
              </P4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
