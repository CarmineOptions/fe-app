import { useState } from "react";
import { Pool } from "../../classes/Pool";
import { PairNamedBadge, TokenBadge, TokenNamedBadge } from "../TokenBadge";

import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useCurrency } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { math64toDecimal } from "../../utils/units";
import { useAccount, useConnect } from "@starknet-react/core";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { setSidebarContent, showToast } from "../../redux/actions";
import { PoolSidebarSuccess } from "./PoolSidebarSuccess";
import { TransactionState } from "../../types/network";
import { useStakes } from "../../hooks/useStakes";
import { handleDeposit, handleWithdraw } from "../Yield/handleAction";
import { usePoolInfo } from "../../hooks/usePoolInfo";

import styles from "./pool.module.css";
import { formatNumber } from "../../utils/utils";
import { TokenKey } from "../../classes/Token";
import { LoadingAnimation } from "../Loading/Loading";
import { BoxTwoValues } from "./Utils";
import { useDefispringApy } from "../../hooks/useDefyspringApy";

type Props = {
  pool: Pool;
  initialAction?: "deposit" | "withdraw";
};

export const PoolSidebar = ({ pool, initialAction }: Props) => {
  const { account } = useAccount();
  const { connectAsync } = useConnect();
  const { poolInfo } = usePoolInfo(pool.apiPoolId);
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
    if (action === "deposit" && account) {
      const done = (tx: string) => {
        setSidebarContent(
          <PoolSidebarSuccess pool={pool} amount={amount} tx={tx} />
        );
      };
      handleDeposit(account, amount, pool, setTxState, done);
    }
    if (action === "withdraw" && account && poolData && userPosition) {
      if (userPosition < amount) {
        showToast(
          `Cannot withdraw ${formatNumber(amount)}, you have ${formatNumber(
            userPosition
          )}`
        );
        setTxState(TransactionState.Fail);
        return;
      }
      handleWithdraw(account, amount, poolData, setTxState);
    }
  };
  return (
    <div className={styles.sidebar}>
      <div className={styles.desc}>
        <PairNamedBadge tokenA={pool.baseToken} tokenB={pool.quoteToken} />
        <div className={styles.poolid}>
          <TokenBadge token={pool.underlying} size="small" />{" "}
          {pool.typeAsText.toUpperCase()} POOL
        </div>
      </div>
      <div className={styles.action}>
        <div className={styles.actionbuttons}>
          <button
            onClick={() => setAction("deposit")}
            className={action === "deposit" ? styles.active : ""}
          >
            deposit
          </button>
          <button
            onClick={() => setAction("withdraw")}
            className={action === "withdraw" ? styles.active : ""}
          >
            withdraw
          </button>
        </div>
        <div>
          <div className={styles.tokeninput}>
            <div className={styles.under}>
              <input
                onChange={handleChange}
                type="text"
                placeholder="amount"
                value={amountText}
              />
              <span className={styles.tiny} style={{ alignSelf: "flex-start" }}>
                ${price === undefined ? "--" : formatNumber(price * amount)}
              </span>
            </div>
            <div>
              <TokenNamedBadge token={pool.underlying} size="small" />
            </div>
          </div>
          <div className={styles.balance}>
            <span className="greytext">balance</span>
            <span>
              {balance === undefined ? (
                <LoadingAnimation size={12} />
              ) : (
                formatNumber(balance)
              )}
            </span>
            <button onClick={handleMax}>max</button>
          </div>
        </div>
        <div>
          <div>
            {account === undefined ? (
              <button
                onClick={() => openWalletConnectDialog(connectAsync)}
                className={"primary active mainbutton"}
              >
                Connect Wallet
              </button>
            ) : txState === TransactionState.Initial ? (
              <button
                onClick={handleActionClick}
                className={"primary active mainbutton"}
              >
                {action}
              </button>
            ) : txState === TransactionState.Processing ? (
              <button
                onClick={handleActionClick}
                className={"primary active mainbutton"}
                disabled
              >
                Processing...
              </button>
            ) : txState === TransactionState.Success ? (
              <button
                onClick={handleActionClick}
                className={"green active mainbutton"}
              >
                Success
              </button>
            ) : (
              <button
                onClick={handleActionClick}
                className={"red active mainbutton"}
              >
                Fail
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.userpos}>
        <div>
          <span className="greytext">MY POSITION</span>
        </div>
        <div>
          <span>
            {userPosition === undefined ? "--" : formatNumber(userPosition, 4)}
          </span>
          <span>{pool.underlying.symbol}</span>
        </div>
        <div>
          <span className={styles.tiny}>
            {userPosition === undefined || price === undefined
              ? "--"
              : `$${formatNumber(userPosition * price, 2)}`}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={`${styles.big} ${styles.apart}`}>
          <span className="greytext">APY</span>{" "}
          <span
            className={
              finalApy === undefined
                ? ""
                : finalApy > 0
                ? "greentext"
                : "redtext"
            }
          >
            {finalApy === undefined ? "--" : finalApy.toFixed(2)}%
          </span>
        </div>
        <BoxTwoValues
          title="TVL"
          topValue={
            tvl === undefined
              ? "--"
              : formatNumber(tvl, 2) + " " + pool.underlying.symbol
          }
          bottomValue={
            price === undefined || tvl === undefined
              ? "---"
              : `$${formatNumber(price * tvl, 2)}`
          }
        />
        <div className="divider" style={{ margin: "5px 0" }}></div>
        <BoxTwoValues
          title="UNLOCKED"
          topValue={
            unlocked === undefined
              ? "--"
              : formatNumber(unlocked, 2) + " " + pool.underlying.symbol
          }
          bottomValue={
            price === undefined || unlocked === undefined
              ? "---"
              : `$${formatNumber(price * unlocked, 2)}`
          }
          conf={{ size: "small" }}
        />
        <BoxTwoValues
          title="LOCKED"
          topValue={
            locked === undefined
              ? "--"
              : formatNumber(locked, 2) + " " + pool.underlying.symbol
          }
          bottomValue={
            price === undefined || locked === undefined
              ? "---"
              : `$${formatNumber(price * locked, 2)}`
          }
          conf={{ size: "small" }}
        />
      </div>
    </div>
  );
};
