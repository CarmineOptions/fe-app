import { ChangeEvent, useEffect, useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useCurrency } from "../../hooks/useCurrency";
import { LoadingAnimation } from "../Loading/Loading";
import { shortInteger } from "../../utils/computations";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import {
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
import buttonStyles from "../../style/button.module.css";
import { Token, TokenKey } from "../../classes/Token";

import styles from "./priceguard.module.css";
import { getPremia } from "../../calls/getPremia";
import { math64toDecimal } from "../../utils/units";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

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
      className={buttonStyles.secondary}
      disabled={txPending}
      onClick={handleButtonClick}
    >
      {txPending ? "Processing" : `Protect my ${option.baseToken.symbol}`}
    </button>
  );
};

export const BuyPriceGuardBox = () => {
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

  useEffect(() => {
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
    getPremia(pickedOption, size, false).then((res) => {
      setPrice(math64toDecimal(res as bigint));
    });
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

  const handleStrikeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrentStrike(parseFloat(event.target.value) as number);
  };

  const handleExpiryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setExpiry(parseInt(event.target.value) as number);
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
      <div className={styles.item}>Asset to protect</div>
      <div className={styles.item}>Amount to protect</div>
      <div className={styles.item}>Price to secure</div>
      <div className={styles.item}>Duration / Until</div>
      <div className={styles.item}>Total coverage price</div>
      <div className={styles.item}>
        <select id="currency" value={currency} onChange={handleCurrencyChange}>
          <option value={TokenKey.STRK}>STRK</option>
          <option value={TokenKey.ETH}>ETH</option>
          <option value={TokenKey.BTC}>wBTC</option>
        </select>
      </div>
      <div className={styles.item}>
        <div className={styles.column}>
          <input placeholder="0" value={textSize} onChange={handleSizeChange} />
          {displayBalance && (
            <span>
              Available: {displayBalance} {token.symbol}{" "}
              <button onClick={handleAll}>All</button>
            </span>
          )}
          {displayBalance === undefined && <span>Loading...</span>}
        </div>
      </div>
      <div className={styles.item}>
        <select id="strike" value={currentStrike} onChange={handleStrikeChange}>
          {strikes.map((strike, i) => (
            <option key={i} value={strike}>
              $ {strike}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.item}>
        <select id="maturity" value={expiry} onChange={handleExpiryChange}>
          {expiries.map((exp, i) => (
            <option key={i} value={exp}>
              {timestampToPriceGuardDate(exp * 1000)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.item}>
        <div className={styles.buy}>
          {price !== undefined && `$${price.toFixed(2)}`}
          {price !== undefined && account === undefined && (
            <button
              className={buttonStyles.secondary}
              onClick={openWalletConnectDialog}
            >
              Connect wallet
            </button>
          )}
          {price !== undefined && account && (
            <BuyPriceGuardButton option={pickedOption} size={size} />
          )}
        </div>
      </div>
    </div>
  );
};
