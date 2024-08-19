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
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { Token, TokenKey } from "../../classes/Token";
import { getPremia } from "../../calls/getPremia";
import { math64toDecimal } from "../../utils/units";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import { ReactComponent as CogIcon } from "./cog.svg";
import styles from "./priceguard.module.css";

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
  const displayBalance =
    balance === undefined
      ? undefined
      : shortInteger(balance.toString(10), token.decimals).toFixed(4);
  const valueInUsd = useCurrency(currency);
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("");
  const [expiry, setExpiry] = useState<number>();
  const [priceMath64, setPrice] = useState<bigint | undefined>();
  const [priceLoading, setPriceLoading] = useState(false);
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [slippage, setSlippage] = useState<number>(5);

  const price =
    priceMath64 === undefined ? undefined : math64toDecimal(priceMath64);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
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

      if (!pickedOption) {
        return;
      }
      setPriceLoading(true);
      getPremia(pickedOption, size, false)
        .then((res) => {
          if (controller.signal.aborted) {
            return;
          }
          setPrice(res as bigint);
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

  const openSlippageModal = () => setSlippageModalOpen(true);
  const closeSlippageModal = () => setSlippageModalOpen(false);

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

  const BuyPriceGuardButton = () => {
    const [tradeState, updateTradeState] = useState<
      "initial" | "processing" | "fail" | "success"
    >("initial");
    const handleButtonClick = () => {
      if (
        !account ||
        priceMath64 === undefined ||
        price === undefined ||
        balance === undefined
      ) {
        return;
      }
      const premiaWithSlippage =
        (priceMath64 * (100n + BigInt(slippage))) / 100n; // TODO: slippage 5%, change it to use argument

      approveAndTradeOpenNew(
        account,
        pickedOption,
        size,
        premiaWithSlippage,
        balance,
        updateTradeState,
        true
      );
    };

    const className = `${styles.buybutton} ${styles[tradeState]}`;
    const disabled = tradeState === "processing";
    const content =
      tradeState === "initial" ? (
        `Protect my ${pickedOption.baseToken.symbol}`
      ) : tradeState === "processing" ? (
        <LoadingAnimation size={13} />
      ) : tradeState === "fail" ? (
        "Failed"
      ) : (
        "Success!"
      );

    return (
      <button
        className={className}
        disabled={disabled}
        onClick={handleButtonClick}
      >
        {content}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div>
        <div>
          <div className={styles.header}>
            <h4>Protect asset</h4>
            <div style={{ position: "relative" }} onClick={openSlippageModal}>
              <div className={styles.cog}>
                <CogIcon />
              </div>
              {slippageModalOpen && (
                <div
                  className={styles.slippagemodal}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4>Transaction Settings</h4>
                  <div>
                    <div className={styles.title}>
                      Slippage
                      <InfoIcon msg="Slippage is the difference between the expected price of a trade and the actual price at which it is executed" />
                    </div>
                    <div className={styles.slippagebuttons}>
                      {[0, 1, 3, 5, 10].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setSlippage(s)}
                          className={slippage === s ? styles.selected : ""}
                        >
                          {s}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={closeSlippageModal}
                    className={styles.active}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ margin: "25px 0" }} className={styles.divider}></div>
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
          <div onClick={handleAll} className={styles.balance}>
            <span>balance</span>
            <span>
              {displayBalance === undefined ? (
                <div className={styles.balanceloading}>
                  <LoadingAnimation size={10} /> {token.symbol}
                </div>
              ) : (
                `${displayBalance} ${token.symbol}`
              )}
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
          {expiries.map((exp, i) => {
            const [date, time] = timestampToPriceGuardDate(exp);
            const className =
              exp === expiry
                ? `${styles.datetime} ${styles.active}`
                : styles.datetime;
            return (
              <button key={i} className={className}>
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
          {strikes.map((strike, i) => {
            const className =
              strike === currentStrike
                ? `${styles.datetime} ${styles.active}`
                : styles.datetime;
            return (
              <button
                key={i}
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
          {priceLoading || price === undefined ? (
            <LoadingAnimation size={20} />
          ) : (
            "$" + price.toFixed(3)
          )}
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
        ) : price === undefined || priceMath64 === undefined ? (
          <button className={styles.buybutton}>loading</button>
        ) : (
          <BuyPriceGuardButton />
        )}
      </div>

      {slippageModalOpen && (
        <div className={styles.overlay} onClick={closeSlippageModal}></div>
      )}
    </div>
  );
};
