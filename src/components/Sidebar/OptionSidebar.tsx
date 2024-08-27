import { useCallback, useEffect, useState } from "react";
import { PairNamedBadge } from "../TokenBadge";

import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useCurrency } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { TransactionState } from "../../types/network";
import { OptionWithPremia } from "../../classes/Option";

import poolStyles from "./pool.module.css";
import styles from "./option.module.css";
import { debounce, timestampToPriceGuardDate } from "../../utils/utils";
import { fetchModalData } from "../TradeTable/fetchModalData";
import { debug } from "../../utils/debugger";
import { LoadingAnimation } from "../Loading/Loading";

type Props = {
  option: OptionWithPremia;
};

export const OptionSidebar = ({ option }: Props) => {
  const account = useAccount();
  const price = useCurrency(option.underlying.id);
  const balanceRaw = useUserBalance(option.underlying.address);
  const [amount, setAmount] = useState<number>(0);
  const [amountText, setAmountText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sizeOnePremiaUsd, setSizeOnePremiaUsd] = useState<number>();
  const [sizeOnePremia, setSizeOnePremia] = useState<number>();
  const [premiaUsd, setPremiaUsd] = useState<number>();
  const [premia, setPremia] = useState<number>();
  const [premiaMath64, setPremiaMath64] = useState<bigint | undefined>();
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.Initial
  );

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
      fetchModalData(size, option, account, controller.signal)
        .then((v) => {
          if (v && v.prices && v.premiaMath64) {
            const { prices } = v;
            setPremia(prices.premia);
            setPremiaUsd(prices.premiaUsd);
            setSizeOnePremia(prices.sizeOnePremia);
            setSizeOnePremiaUsd(prices.sizeOnePremiaUsd);
            setPremiaMath64(v.premiaMath64);
            setLoading(false);
          }
        })
        .catch((e) => {
          debug("Failed fetching modal data");
          debug("warn", e.message);
        });
    }),
    [option.optionId]
  );

  useEffect(() => {
    if (amount === 0 || amountText === "") {
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    callWithDelay(amount, controller);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, option.optionId]);

  useEffect(() => {
    return () => {
      setAmount(0);
      setAmountText("");
    };
  }, [option.optionId]);

  const balance =
    balanceRaw === undefined
      ? undefined
      : shortInteger(balanceRaw, option.underlying.decimals);

  const [date, time] = timestampToPriceGuardDate(option.maturity);

  return (
    <div className={poolStyles.sidebar + " " + styles.option}>
      <div className={styles.desc}>
        <PairNamedBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
          size={32}
        />
        <div
          className={
            styles.side + " " + styles[option.sideAsText.toLowerCase()]
          }
        >
          {option.sideAsText}
        </div>
      </div>
      <div className={styles.inputcontainer}>
        <div>
          <span>option size</span>
          <span>contracts</span>
        </div>
        <div>
          <input
            onChange={handleChange}
            type="text"
            placeholder="size"
            value={amountText}
          />
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>{option.isLong ? "pay" : "receive"}</span>
        </div>
        <div>
          {loading && (
            <div className={styles.databoxloading}>
              <LoadingAnimation size={25} />
            </div>
          )}
          {!loading && (
            <span>
              {premia === undefined
                ? "--"
                : `${premia.toFixed(4)} ${option.underlying.symbol}`}
            </span>
          )}
          {!loading && (
            <span>
              $
              {price === undefined || premia === undefined
                ? "--"
                : (price * premia).toFixed(2)}
            </span>
          )}
        </div>
      </div>
      {option.isShort && (
        <div className={styles.databox}>
          <div>
            <span>lock in</span>
          </div>
          <div>
            <span>
              {amount === 0 ? "--" : `${amount} ${option.underlying.symbol}`}
            </span>
            <span>
              $
              {price === undefined || amount === 0
                ? "--"
                : (price * amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
      <div className={styles.databox}>
        <div>
          <span>your balance</span>
        </div>
        <div>
          <span>
            {balance === undefined
              ? "--"
              : `${balance.toFixed(4)} ${option.underlying.symbol}`}
          </span>
          <span>
            $
            {price === undefined || balance === undefined
              ? "--"
              : (price * balance).toFixed(2)}
          </span>
        </div>
      </div>
      {account === undefined ? (
        <button
          className="mainbutton primary active"
          onClick={openWalletConnectDialog}
        >
          Connect Wallet
        </button>
      ) : (
        <button className="mainbutton primary active">Buy</button>
      )}
      <div className={styles.dividertext}>
        <span>option info</span>
        <div className="divider"></div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>strike</span>
        </div>
        <div>
          <span>${option.strike}</span>
          <span>
            1 {option.underlying.symbol} = ${option.strike}
          </span>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>maturity</span>
        </div>
        <div>
          <span>{date}</span>
          <span style={{ color: "white" }}>{time}</span>
        </div>
      </div>
      <div className={styles.dividertext}>
        <span>payoff</span>
        <div className="divider"></div>
      </div>
      <div className={styles.graphbox}>TODO: GRAPH</div>
      <div className={styles.databox}>
        <div>
          <span>max profit</span>
        </div>
        <div>
          <span>123 {option.underlying.symbol}</span>
          <span>$456</span>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>max loss</span>
        </div>
        <div>
          <span>0.321 {option.underlying.symbol}</span>
          <span>$6.54</span>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>breakeven</span>
        </div>
        <div>
          <span>$12</span>
          <span>1 {option.underlying.symbol} = $12</span>
        </div>
      </div>
    </div>
  );
};
