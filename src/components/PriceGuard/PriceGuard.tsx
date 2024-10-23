import { useCallback, useEffect, useState } from "react";
import { useAccount, useConnect } from "@starknet-react/core";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useCurrency } from "../../hooks/useCurrency";
import { LoadingAnimation } from "../Loading/Loading";
import { shortInteger } from "../../utils/computations";
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
import { MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import { ReactComponent as CogIcon } from "./cog.svg";
import styles from "./priceguard.module.css";
import { TokenNamedBadge } from "../TokenBadge";
import { TransactionState } from "../../types/network";
import { useOptions } from "../../hooks/useOptions";

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
  const { account } = useAccount();
  const { connectAsync } = useConnect();
  const [currency, setCurrency] = useState<TokenKey>(TokenKey.STRK);
  const token = Token.byKey(currency);
  const { data: balance } = useUserBalance(token.address);
  const displayBalance =
    balance === undefined
      ? undefined
      : shortInteger(balance.toString(10), token.decimals).toFixed(4);
  const valueInUsd = useCurrency(currency);
  const { options, isLoading, isError } = useOptions();
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("");
  const [expiry, setExpiry] = useState<number>();
  const [priceMath64, setPrice] = useState<bigint | undefined>();
  const [priceLoading, setPriceLoading] = useState(false);
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [slippage, setSlippage] = useState<number>(5);
  const [slippageText, setSlippageText] = useState<string>("5");

  const price =
    priceMath64 === undefined ? undefined : math64toDecimal(priceMath64);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
      if (!options) {
        return;
      }
      const longPuts = options.filter(
        // only Long Puts for the chosen currency
        (o) =>
          o.baseToken.id === currency &&
          o.quoteToken.id === TokenKey.USDC &&
          o.isPut &&
          o.isLong &&
          o.isFresh
      );
      const pickedOption = longPuts.find(
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
    [options, expiry, currentStrike]
  );

  useEffect(() => {
    const controller = new AbortController();
    callWithDelay(size, controller);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, expiry, currentStrike, size, options]);

  if (valueInUsd === undefined || isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <p>Something went wrong, please try again later</p>;
  }

  const longPuts = options.filter(
    // only Long Puts for the chosen currency
    (o) =>
      o.baseToken.id === currency &&
      o.quoteToken.id === TokenKey.USDC &&
      o.isPut &&
      o.isLong &&
      o.isFresh
  );

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    const newCurrency = event.target.value as TokenKey;
    const longPuts = options.filter(
      // only Long Puts for the chosen currency
      (o) =>
        o.baseToken.id === newCurrency &&
        o.quoteToken.id === TokenKey.USDC &&
        o.isPut &&
        o.isLong &&
        o.isFresh
    );
    setCurrency(newCurrency);
    if (longPuts.length) {
      setCurrentStrike(longPuts[0].strike);
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
  const handleChange = handleNumericChangeFactory(setSlippageText, setSlippage);
  const handleSlippageButton = (s: number) => {
    setSlippage(s);
    setSlippageText(`${s}`);
  };

  // show all expiries
  const expiries = longPuts
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues)
    .sort();

  if (longPuts.length > 0 && (!expiry || !expiries.includes(expiry))) {
    setExpiry(expiries[0]);
  }

  // show strikes for current expiry
  const strikes = longPuts
    .filter((o) => o.maturity === expiry)
    .map((o) => o.strike)
    .filter(uniquePrimitiveValues)
    .sort();

  if (
    longPuts.length > 0 &&
    (!currentStrike || !strikes.includes(currentStrike))
  ) {
    setCurrentStrike(strikes[0]);
  }

  const pickedOption = longPuts.find(
    (o) => o.maturity === expiry && o.strike === currentStrike
  )!;

  const BuyPriceGuardButton = () => {
    const [tradeState, updateTradeState] = useState(TransactionState.Initial);
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
        (priceMath64 * (100000n + BigInt(Math.round(slippage * 1000)))) /
        100000n;

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

    const buttonColor =
      tradeState === TransactionState.Initial
        ? "primary-bg black-col"
        : tradeState === TransactionState.Processing
        ? "secondary-bg black-col"
        : tradeState === TransactionState.Fail
        ? "error-bg white-col"
        : "success-bg white-col";

    const className = `mainbutton ${buttonColor}`;
    const disabled = tradeState === TransactionState.Processing;
    const content =
      tradeState === TransactionState.Initial ? (
        `Protect my ${pickedOption.baseToken.symbol}`
      ) : tradeState === TransactionState.Processing ? (
        <LoadingAnimation size={13} />
      ) : tradeState === TransactionState.Fail ? (
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
                      {[0, 2, 5].map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSlippageButton(s)}
                          className={
                            slippage === s ? "secondary active" : "secondary"
                          }
                        >
                          {s}%
                        </button>
                      ))}
                      <div>
                        <input
                          type="text"
                          value={slippageText}
                          onChange={handleChange}
                        />
                        <span>%</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeSlippageModal}
                    className="secondary active"
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
              <Select
                value={currency}
                onChange={handleCurrencyChange}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  width: "170px",
                }}
              >
                {[TokenKey.STRK, TokenKey.ETH, TokenKey.BTC].map((t, i) => (
                  <MenuItem key={i} value={t}>
                    <div className={styles.tokenwrapper}>
                      <TokenNamedBadge token={Token.byKey(t)} />
                    </div>
                  </MenuItem>
                ))}
              </Select>
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
            const isActive = exp === expiry;
            const className = isActive ? "secondary active" : "secondary";
            return (
              <button key={i} className={className}>
                <div
                  className={styles.maturitybutton}
                  onClick={() => handleExpiryChange(exp)}
                >
                  <span className={isActive ? "black-col" : "white-col"}>
                    {date}
                  </span>
                  <span className={isActive ? "black-col" : "white-col"}>
                    {time}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.title}>
          Protection price
          <InfoIcon
            msg={`Set the price point for your ${token.symbol} holdings, ensuring protection if the asset falls below this point.`}
          />
        </div>
        <div>
          {strikes.map((strike, i) => {
            const className =
              strike === currentStrike ? "secondary active" : "secondary";
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
            <div>
              <LoadingAnimation size={28.8} />
            </div>
          ) : (
            <div>
              <span>${price.toFixed(3)}</span>
              <span>
                {slippage}% slippage $
                {(price * (1 + slippage / 100)).toFixed(3)}
              </span>
            </div>
          )}
        </span>
      </div>
      <div>
        {account === undefined ? (
          <button
            className={styles.buybutton}
            onClick={() => openWalletConnectDialog(connectAsync)}
          >
            Connect Wallet
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
