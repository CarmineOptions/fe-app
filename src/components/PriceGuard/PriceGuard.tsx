import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useCurrency } from "../../hooks/useCurrency";
import { LoadingAnimation } from "../Loading/Loading";
import { shortInteger } from "../../utils/computations";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import {
  debounce,
  timestampToPriceGuardDate,
  uniquePrimitiveValues,
} from "../../utils/utils";
import { debug } from "../../utils/debugger";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import {
  openBuyPriceGuardDialog,
  setBuyPriceGuardModal,
  showToast,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { Option } from "../../classes/Option";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import { Token, TokenKey } from "../../classes/Token";
import { getPremia } from "../../calls/getPremia";
import { math64toDecimal } from "../../utils/units";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { Info } from "@mui/icons-material";

import styles from "./priceguard.module.css";
import { Tooltip } from "@mui/material";

type BuyButtonProps = {
  option: Option;
  size: number;
};

const BuyPriceGuardButton = ({ option, size }: BuyButtonProps) => {
  const txPending = useTxPending(option.optionId, TransactionAction.TradeOpen);
  const handleButtonClick = () => {
    if (size === 0) {
      showToast("Please select size greater than 0", ToastType.Warn);
      return;
    }
    if (!option) {
      showToast("Select a priceGuard first", ToastType.Warn);
      return;
    }
    debug("Buying this option", option, "with size", size);
    setBuyPriceGuardModal({ option: option, size });
    option.sendViewEvent(true);
    openBuyPriceGuardDialog();
  };

  return (
    <button
      className={styles.buybutton}
      disabled={txPending}
      onClick={handleButtonClick}
    >
      {txPending ? "Processing" : `Protect my ${option.baseToken.symbol}`}
    </button>
  );
};

const InfoIcon = ({ msg }: { msg: string }) => {
  return (
    <Tooltip title={msg}>
      <div className={styles.info}>
        <Info />
      </div>
    </Tooltip>
  );
};

export const PriceGuard = () => {
  const account = useAccount();
  const [currency, setCurrency] = useState<TokenKey>(TokenKey.STRK);
  const token = Token.byKey(currency);
  const balance = useUserBalance(token.address);
  const displayBalance = balance
    ? shortInteger(balance.toString(10), token.decimals).toFixed(4)
    : undefined;
  const valueInUsd = useCurrency(currency);
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("");
  const [expiry, setExpiry] = useState<number>();
  const [price, setPrice] = useState<number | undefined>();
  const [priceLoading, setPriceLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
      console.log("DEBOUNCING", data);
      if (!data) {
        return;
      }
      const options = data.filter(
        // only Long Puts for the chosen currency
        (o) =>
          o.baseToken.id === currency &&
          o.quoteToken.id === TokenKey.USDC &&
          o.isPut &&
          o.isLong &&
          o.isFresh
      );
      const pickedOption = options.find(
        (o) => o.maturity === expiry && o.strike === currentStrike
      )!;

      console.log("OPTION MAYBE", pickedOption);
      if (!pickedOption) {
        return;
      }
      console.log("GETTING PRICE GUARD");
      setPriceLoading(true);
      getPremia(pickedOption, size, false)
        .then((res) => {
          console.log("GOT PRICE GUARD", res);
          if (controller.signal.aborted) {
            return;
          }
          console.log("PAST CONTROLLER PRICE GUARD", res);
          setPrice(math64toDecimal(res as bigint));
          setPriceLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) {
            return;
          }
          setPriceLoading(false);
        });
    }),
    [data, expiry, currentStrike]
  );

  useEffect(() => {
    const controller = new AbortController();
    callWithDelay(size, controller);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, expiry, currentStrike, size, data]);

  if (valueInUsd === undefined || isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <p>Something went wrong, please try again later</p>;
  }

  const options = data.filter(
    // only Long Puts for the chosen currency
    (o) =>
      o.baseToken.id === currency &&
      o.quoteToken.id === TokenKey.USDC &&
      o.isPut &&
      o.isLong &&
      o.isFresh
  );

  const handleCurrencyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value as TokenKey;
    const options = data.filter(
      // only Long Puts for the chosen currency
      (o) =>
        o.baseToken.id === newCurrency &&
        o.quoteToken.id === TokenKey.USDC &&
        o.isPut &&
        o.isLong &&
        o.isFresh
    );
    setCurrency(newCurrency);
    if (options.length) {
      setCurrentStrike(options[0].strike);
      setExpiry(options[0].maturity);
    }
  };

  const handleStrikeChange = (strike: number) => {
    setCurrentStrike(strike);
  };

  const handleExpiryChange = (exp: number) => {
    setExpiry(exp);
  };

  const handleSizeChange = handleNumericChangeFactory(
    setTextSize,
    setSize,
    (n) => {
      return n;
    }
  );

  const handleAll = () => {
    if (displayBalance === undefined) {
      return;
    }
    setSize(parseFloat(displayBalance));
    setTextSize(displayBalance);
  };

  // show all expiries
  const expiries = options
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues)
    .sort();

  if (options.length > 0 && !expiry) {
    setExpiry(expiries[0]);
  }

  // show strikes for current expiry
  const strikes = options
    .filter((o) => o.maturity === expiry)
    .map((o) => o.strike)
    .filter(uniquePrimitiveValues)
    .sort();

  if (
    options.length > 0 &&
    (!currentStrike || !strikes.includes(currentStrike))
  ) {
    setCurrentStrike(strikes[0]);
  }

  const pickedOption = options.find(
    (o) => o.maturity === expiry && o.strike === currentStrike
  )!;

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>
          Asset & Amount
          <InfoIcon msg="This is the asset you want to shield against price drops." />
        </div>
        <div className={styles.assetamount}>
          <div>
            <div>
              <input
                placeholder="Enter amount"
                value={textSize}
                onChange={handleSizeChange}
              />
              <select
                id="currency"
                value={currency}
                onChange={handleCurrencyChange}
              >
                <option value={TokenKey.STRK}>STRK</option>
                <option value={TokenKey.ETH}>ETH</option>
                <option value={TokenKey.BTC}>wBTC</option>
              </select>
            </div>
          </div>
          <div className={styles.balance}>
            <span>balance</span>
            <span>
              {displayBalance === undefined ? "---" : displayBalance}{" "}
              {token.symbol}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.title}>
          Duration
          <InfoIcon msg="Select how long you want the protection to last. This date marks the end of the plan." />
        </div>
        <div>
          {expiries.map((exp) => {
            const [date, time] = timestampToPriceGuardDate(exp);
            const className =
              exp === expiry
                ? `${styles.datetime} ${styles.active}`
                : styles.datetime;
            return (
              <button className={className}>
                <div onClick={() => handleExpiryChange(exp)}>
                  <span>{date}</span>
                  <span>{time}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.title}>
          Protection price
          <InfoIcon msg="Set the price point for your STRK holdings, ensuring protection if the asset falls below this point." />
        </div>
        <div>
          {strikes.map((strike) => {
            const className =
              strike === currentStrike
                ? `${styles.datetime} ${styles.active}`
                : styles.datetime;
            return (
              <button
                onClick={() => handleStrikeChange(strike)}
                className={className}
              >
                ${strike}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.coverage}>
        <span className={styles.title}>Final coverage price</span>
        <span className={styles.finalprice}>
          {priceLoading || price === undefined ? "---" : "$" + price.toFixed(3)}
        </span>
      </div>
      <div>
        {account === undefined ? (
          <button
            className={styles.buybutton}
            onClick={openWalletConnectDialog}
          >
            Connect wallet
          </button>
        ) : price === undefined ? (
          <button className={styles.buybutton}>loading</button>
        ) : (
          <BuyPriceGuardButton option={pickedOption} size={size} />
        )}
      </div>
    </div>
  );
};
