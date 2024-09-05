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
import {
  debounce,
  formatNumber,
  timestampToPriceGuardDate,
} from "../../utils/utils";
import { fetchModalData } from "../TradeTable/fetchModalData";
import { debug, LogTypes } from "../../utils/debugger";
import { LoadingAnimation } from "../Loading/Loading";
import { TokenKey } from "../../classes/Token";
import { setSidebarContent, showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import { OptionSidebarSuccess } from "./OptionSidebarSuccess";

import poolStyles from "./pool.module.css";
import styles from "./option.module.css";
import { getProfitGraphData } from "../CryptoGraph/profitGraphData";
import { ProfitGraph } from "../CryptoGraph/ProfitGraph";

type Props = {
  option: OptionWithPremia;
};

export const OptionSidebar = ({ option }: Props) => {
  const account = useAccount();
  const price = useCurrency(option.underlying.id);
  const balanceRaw = useUserBalance(option.underlying.address);
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");
  const [loading, setLoading] = useState<boolean>(false);
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

  const handleBuy = () => {
    if (!account) {
      debug(LogTypes.WARN, "No account", account);
      return;
    }

    if (balanceRaw === undefined || premiaMath64 === undefined) {
      debug(LogTypes.WARN, "No user balance");
      return;
    }

    if (!amount) {
      showToast("Cannot trade size 0", ToastType.Warn);
      return;
    }

    const callback = (tx: string) => {
      setSidebarContent(
        <OptionSidebarSuccess option={option} tx={tx} amount={amount} />
      );
    };

    approveAndTradeOpenNew(
      account,
      option,
      amount,
      premiaMath64,
      balanceRaw,
      setTxState,
      false, // not priceguard
      callback // open success sidebar when done
    ).catch(() => setTxState(TransactionState.Fail));
  };

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

  const graphData =
    premiaUsd === undefined || amount === 0
      ? undefined
      : getProfitGraphData(option, premiaUsd, amount);

  const limited =
    premia === undefined
      ? "--"
      : formatNumber(premia, 4) + " " + option.underlying.symbol;
  const limitedUsd =
    premiaUsd === undefined ? "--" : "$" + formatNumber(premiaUsd, 4);
  const unlimited = "Unlimited";
  const breakEven =
    sizeOnePremia === undefined
      ? "--"
      : `${option.quoteToken.id === TokenKey.USDC ? "$" : ""}` +
        formatNumber(
          option.isCall
            ? option.strike + sizeOnePremia
            : option.strike - sizeOnePremia,
          2
        ) +
        `${
          option.quoteToken.id === TokenKey.USDC ? "" : option.quoteToken.symbol
        }`;

  return (
    <div className={poolStyles.sidebar + " " + styles.option}>
      <div className={styles.desc}>
        <PairNamedBadge tokenA={option.baseToken} tokenB={option.quoteToken} />
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
                : `${formatNumber(premia, 4)} ${option.underlying.symbol}`}
            </span>
          )}
          {!loading && (
            <span>
              $
              {price === undefined || premia === undefined
                ? "--"
                : formatNumber(price * premia, 2)}
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
              {amount === 0
                ? "--"
                : `${amount * (option.isPut ? option.strike : 1)} ${
                    option.underlying.symbol
                  }`}
            </span>
            <span>
              $
              {price === undefined || amount === 0
                ? "--"
                : formatNumber(
                    price * amount * (option.isPut ? option.strike : 1)
                  )}
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
              : `${formatNumber(balance, 4)} ${option.underlying.symbol}`}
          </span>
          <span>
            $
            {price === undefined || balance === undefined
              ? "--"
              : formatNumber(price * balance)}
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
      ) : txState === TransactionState.Initial ? (
        <button onClick={handleBuy} className="mainbutton primary active">
          Buy
        </button>
      ) : txState === TransactionState.Processing ? (
        <button disabled className="mainbutton primary active">
          <LoadingAnimation size={20} />
        </button>
      ) : txState === TransactionState.Success ? (
        <button onClick={handleBuy} className="mainbutton green active">
          Success
        </button>
      ) : (
        <button onClick={handleBuy} className="mainbutton red active">
          Fail
        </button>
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
          <span>{option.strikeWithCurrency}</span>
          <span>
            1 {option.baseToken.symbol} = {option.strikeWithCurrency}
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
      <div className={styles.graphbox}>
        {graphData && <ProfitGraph data={graphData} />}
      </div>
      <div className={styles.databox}>
        <div>
          <span>max profit</span>
        </div>
        <div>
          <span>{option.isLong ? unlimited : limited}</span>
          <span>{option.isLong ? "" : limitedUsd}</span>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>max loss</span>
        </div>
        <div>
          <span>{option.isLong ? limited : unlimited}</span>
          <span>{option.isLong ? limitedUsd : ""}</span>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>breakeven</span>
        </div>
        <div>
          <span>{breakEven}</span>
          <span>
            1 {option.baseToken.symbol} = {breakEven}
          </span>
        </div>
      </div>
    </div>
  );
};
