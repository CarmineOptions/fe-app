import { useState } from "react";
import { Pool } from "../../classes/Pool";
import { PairNamedBadge, TokenBadge, TokenNamedBadge } from "../TokenBadge";

import styles from "./pool.module.css";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useQuery } from "react-query";
import { queryPoolCapital, queryUserPoolInfo } from "./fetchStakeCapital";
import { useCurrency } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { math64toDecimal } from "../../utils/units";
import { useAccount } from "../../hooks/useAccount";

type Props = {
  pool: Pool;
};

export const PoolSidebar = ({ pool }: Props) => {
  const account = useAccount();
  const { data } = useQuery(
    [`pool-data-${pool.apiPoolId}`, pool.apiPoolId],
    queryPoolCapital
  );
  const { data: userPoolData } = useQuery(
    [`user-pool-info-${account?.address}`, account?.address],
    queryUserPoolInfo
  );
  const price = useCurrency(pool.underlying.id);
  const balanceRaw = useUserBalance(pool.underlying.address);

  const [action, setAction] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<number>(0);
  const [amountText, setAmountText] = useState<string>("");

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );
  const handleMax = () => {
    if (balance === undefined) {
      return;
    }
    setAmount(balance);
    setAmountText(balance.toString(10));
  };

  const state = data?.state;
  const apy = data?.apy;
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
    userPoolData === undefined
      ? undefined
      : userPoolData.find((p) => p.lpAddress === pool.lpAddress);

  const userPosition =
    userPoolData === undefined
      ? undefined
      : poolData === undefined // got data and found nothing about this pool
      ? 0
      : poolData.value;

  if (userPoolData) {
    console.log(account?.address, userPoolData, poolData);
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.desc}>
        <PairNamedBadge
          tokenA={pool.baseToken}
          tokenB={pool.quoteToken}
          size={32}
        />
        <div className={styles.poolid}>
          <TokenBadge token={pool.underlying} size={15} />{" "}
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
                ${price === undefined ? "--" : (price * amount).toFixed(2)}
              </span>
            </div>
            <div>
              <TokenNamedBadge token={pool.underlying} size={23} />
            </div>
          </div>
          <div className={styles.balance}>
            <span className="greytext">balance</span>
            <span>{balance}</span>
            <button onClick={handleMax}>max</button>
          </div>
        </div>
        <div>
          <div>
            <button className={`primary active ${styles.mainbutton}`}>
              {action}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.userpos}>
        <div>
          <span className="greytext">MY POSITION</span>
        </div>
        <div>
          <span>
            {userPosition === undefined ? "--" : userPosition.toFixed(4)}
          </span>
          <span>{pool.underlying.symbol}</span>
        </div>
        <div>
          <span className={styles.tiny}>
            {userPosition === undefined || price === undefined
              ? "--"
              : `$${(userPosition * price).toFixed(2)}`}
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={`${styles.big} ${styles.apart}`}>
          <span className="greytext">APY</span>{" "}
          <span
            className={
              apy === undefined
                ? ""
                : apy.launch_annualized > 0
                ? "greentext"
                : "redtext"
            }
          >
            {apy === undefined ? "--" : apy.launch_annualized.toFixed(2)}%
          </span>
        </div>
        <div className={styles.under}>
          <div className={`${styles.big} ${styles.apart}`}>
            <span className="greytext">TVL</span>{" "}
            <span>
              {tvl === undefined ? "--" : tvl.toFixed(2)}{" "}
              {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined || tvl === undefined
              ? "---"
              : `$${(price * tvl).toFixed(2)}`}
          </span>
        </div>
        <div className="divider" style={{ margin: "5px 0" }}></div>
        <div className={styles.under}>
          <div className={`${styles.small} ${styles.apart}`}>
            <span className="greytext">UNLOCKED</span>{" "}
            <span>
              {unlocked === undefined ? "--" : unlocked.toFixed(2)}{" "}
              {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined || unlocked === undefined
              ? "---"
              : `$${(price * unlocked).toFixed(2)}`}
          </span>
        </div>
        <div className={styles.under}>
          <div className={`${styles.small} ${styles.apart}`}>
            <span className="greytext">LOCKED</span>{" "}
            <span>
              {locked === undefined ? "--" : locked.toFixed(2)}{" "}
              {pool.underlying.symbol}
            </span>
          </div>
          <span className={styles.tiny}>
            {price === undefined || locked === undefined
              ? "---"
              : `$${(price * locked).toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};
