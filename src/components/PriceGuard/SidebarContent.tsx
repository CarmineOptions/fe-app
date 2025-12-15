import { useCallback, useEffect, useState } from "react";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { NavLink } from "react-router-dom";

import { useUserBalance } from "../../hooks/useUserBalance";
import { LoadingAnimation } from "../Loading/Loading";
import { shortInteger } from "../../utils/computations";
import {
  debounce,
  formatNumber,
  timestampToPriceGuardDate,
  uniquePrimitiveValues,
} from "../../utils/utils";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import CogIcon from "./cog.svg?react";
import { TransactionState } from "../../types/network";
import { useOptionsAllPools } from "../../hooks/useOptions";
import { Button, Divider, H5, H6, P3, P4 } from "../common";
import { SingleTokenMultichart } from "../CryptoGraph/SingleTokenGraph";
import { TokenSelect } from "../TokenPairSelect";
import CaretDown from "./CaretDown.svg?react";
import LightBulb from "./LightBulb.svg?react";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { USDC_ADDRESS } from "../../constants/amm";
import { closeSidebar } from "../../redux/actions";
import { getProfitGraphData } from "../CryptoGraph/profitGraphData";
import { ProfitGraph } from "../CryptoGraph/ProfitGraph";
import { Warning } from "../Icons";
import { Cubit, Token, tokenBySymbol } from "@carmine-options/sdk/core";
import { useTokenPrice } from "../../hooks/usePrice";

type Props = {
  initialToken: string;
};

export const SidebarContent = ({ initialToken }: Props) => {
  const { address } = useAccount();
  const { sendAsync } = useSendTransaction({});
  const [token, setToken] = useState<Token>(
    tokenBySymbol(initialToken).unwrap()
  );
  const { data: balance } = useUserBalance(USDC_ADDRESS); // currently price protect only vs USDC
  const floatBalance =
    balance === undefined ? undefined : shortInteger(balance.toString(10), 6); // always USDC
  const displayBalance =
    floatBalance === undefined ? undefined : floatBalance.toFixed(4);
  const valueInUsd = useTokenPrice(token.symbol);
  const { options, isLoading, isError } = useOptionsAllPools();
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [priceLoading, setPriceLoading] = useState(false);
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("");
  const [expiry, setExpiry] = useState<number>();
  const [price, setPrice] = useState<Cubit | undefined>();
  const [isMaturitySelectOpen, setMaturitySelectOpen] =
    useState<boolean>(false);
  const [isStrikeSelectOpen, setStrikeSelectOpen] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
      if (!options) {
        return;
      }
      const longPuts = options.filter(
        // only Long Puts for the chosen currency
        (o) =>
          o.base.symbol === token.symbol &&
          o.quote.symbol === "USDC" &&
          o.isPut &&
          o.isLong &&
          o.isFresh
      );
      const pickedOption = longPuts.find(
        (o) => o.maturity === expiry && o.strikePrice.val === currentStrike
      )!;

      if (!pickedOption) {
        return;
      }
      setPriceLoading(true);

      pickedOption
        .getPremia(size, false)
        .then((res) => {
          if (controller.signal.aborted) {
            return;
          }
          setPrice(res.withFees);
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
  }, [token.symbol, expiry, currentStrike, size, options]);

  if (valueInUsd === undefined || isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <p>Something went wrong, please try again later</p>;
  }

  const notEnoughFunds = !!(floatBalance && price && floatBalance < price.val);

  const longPuts = options.filter(
    // only Long Puts for the chosen currency
    (o) =>
      o.base.symbol === token.symbol &&
      o.quote.symbol === "USDC" &&
      o.isPut &&
      o.isLong &&
      o.isFresh
  );

  const handleTokenChange = (newToken: Token) => {
    const longPuts = options.filter(
      // only Long Puts for the chosen currency
      (o) =>
        o.base.symbol === newToken.symbol &&
        o.quote.symbol === "USDC" &&
        o.isPut &&
        o.isLong &&
        o.isFresh
    );
    setToken(newToken);
    if (longPuts.length) {
      setCurrentStrike(longPuts[0].strikePrice.val);
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
    .map((o) => o.strikePrice.val)
    .filter(uniquePrimitiveValues)
    .sort((a, b) => a - b);

  if (
    longPuts.length > 0 &&
    (!currentStrike || !strikes.includes(currentStrike))
  ) {
    setCurrentStrike(strikes[0]);
  }

  const pickedOption = longPuts.find(
    (o) => o.maturity === expiry && o.strikePrice.val === currentStrike
  )!;

  const BuyPriceGuardButton = () => {
    const [tradeState, updateTradeState] = useState(TransactionState.Initial);
    if (!address) {
      return <PrimaryConnectWallet />;
    }

    if (notEnoughFunds) {
      return (
        <Button type="disabled" disabled className="normal-case h-9 w-full">
          Buy Protection with USDC
        </Button>
      );
    }

    const handleButtonClick = () => {
      if (!address || price === undefined || balance === undefined) {
        return;
      }

      approveAndTradeOpenNew(
        address,
        sendAsync,
        pickedOption,
        size,
        price,
        balance,
        updateTradeState,
        true
      );
    };

    const disabled = tradeState === TransactionState.Processing;
    const content =
      tradeState === TransactionState.Initial ? (
        `Buy Protection with ${pickedOption.base.symbol}`
      ) : tradeState === TransactionState.Processing ? (
        <LoadingAnimation size={13} />
      ) : tradeState === TransactionState.Fail ? (
        "Failed"
      ) : (
        "Success!"
      );

    return (
      <Button
        type={
          tradeState === TransactionState.Success
            ? "success"
            : tradeState === TransactionState.Fail
            ? "error"
            : "primary"
        }
        className="normal-case h-9 w-full"
        disabled={disabled}
        onClick={handleButtonClick}
      >
        {content}
      </Button>
    );
  };

  const [date, time] = expiry
    ? timestampToPriceGuardDate(expiry)
    : ["--", "--"];

  const graphData =
    price === undefined || size === 0 || !pickedOption
      ? undefined
      : getProfitGraphData(pickedOption, price.val, size);

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-8">
        <H5 className="font-semibold">Protect asset</H5>
        <div
          className="p-1 cursor-pointer"
          onClick={() => console.log("SLIPPAGE")}
        >
          <CogIcon />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="hidden lg:flex w-[536px] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <P4 className="font-bold text-dark-tertiary">OPTION INFO</P4>
              <P4 className="font-bold text-dark-secondary">
                {valueInUsd === undefined ? "$--" : `$${valueInUsd}`}
              </P4>
              <Divider className="grow" />
            </div>
            <div className="max-w-[536px] h-[245px]">
              <SingleTokenMultichart token={token.symbol} />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <P4 className="font-bold text-dark-tertiary">PAYOFF</P4>
              <P4 className="font-bold text-dark-secondary"> TILL EXPIRY</P4>
              <Divider className="grow" />
            </div>
            <div className="max-w-[536px] h-[180px]">
              {graphData ? (
                <ProfitGraph data={graphData} />
              ) : (
                <LoadingAnimation />
              )}
            </div>
            <div>
              <P4 className="text-dark-secondary">
                Your price protection will be claimable when the value of STRK
                drops below your selected protection price.
              </P4>
              <P4 className="text-dark-secondary">
                As you can see, the claimable value of your protection increases
                as the price of STRK drops more than your protection price. You
                can claim the protection from the portfolio at any point after
                the protection price is crossed.
              </P4>
              <P4 className="text-dark-secondary">
                The claimable value will depend on the price claimed at, as well
                as time left for expiry. If you hold the protection until the
                end of the chosen period, you’ll be able to claim the full value
                based on the price at that time.
              </P4>
            </div>
          </div>
        </div>
        <div className="w-[350px] p-4 mr-4 bg-[#1A1C1E] flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <P4 className="font-bold text-dark-secondary">
              Step 1: Select an asset & amount to protect.
            </P4>
            <div className="flex border-dark-secondary border-[0.5px]">
              <div className="w-full flex flex-col justify-around p-3">
                <input
                  placeholder="Enter amount"
                  value={textSize}
                  onChange={handleSizeChange}
                  className="w-full bg-[#1A1C1E]"
                />
                <P4 className="font-bold text-dark-secondary">
                  {valueInUsd === undefined
                    ? "$--"
                    : `$${formatNumber(size * valueInUsd)}`}
                </P4>
              </div>
              <TokenSelect
                token={token}
                setToken={handleTokenChange}
                tokens={[
                  tokenBySymbol("ETH").unwrap(),
                  tokenBySymbol("wBTC").unwrap(),
                  tokenBySymbol("STRK").unwrap(),
                ]}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <P4 className="font-bold text-dark-secondary">
              Step 2: Select the duration of protection.
            </P4>
            <div className="relative inline-block">
              <button
                type="button"
                className="rounded-sm p-3 w-full text-left bg-dark-primary text-dark shadow-md focus:outline-none focus:ring-2 sm:text-sm"
                onClick={() => setMaturitySelectOpen((prev) => !prev)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <P3 className="font-semibold">{date}</P3>
                    <P4 className="font-bold">{time}</P4>
                  </div>
                  <CaretDown />
                </div>
              </button>
              {isMaturitySelectOpen && (
                <ul className="absolute z-10 mt-1 w-full text-dark-primary bg-dark-container rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {expiries.map((maturity, i) => {
                    const [date, time] = timestampToPriceGuardDate(maturity);
                    return (
                      <li
                        key={i}
                        className="cursor-pointer py-1 px-2"
                        onClick={() => {
                          handleExpiryChange(maturity);
                          setMaturitySelectOpen(false);
                        }}
                      >
                        <div className="flex items-baseline gap-1">
                          <P3 className="font-semibold">{date}</P3>
                          <P4 className="font-bold">{time}</P4>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <P4 className="font-bold text-dark-secondary">
              Step 3: Select the protection price.
            </P4>
            <div className="relative inline-block">
              <button
                type="button"
                className="rounded-sm p-3 w-full text-left bg-dark-primary text-dark shadow-md focus:outline-none focus:ring-2 sm:text-sm"
                onClick={() => setStrikeSelectOpen((prev) => !prev)}
              >
                <div className="flex items-center justify-between">
                  <P3 className="font-semibold">{currentStrike}</P3>
                  <CaretDown />
                </div>
              </button>
              {isStrikeSelectOpen && (
                <ul className="absolute mt-1 w-full text-dark-primary bg-dark-container rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {strikes.map((s, i) => (
                    <li
                      key={i}
                      className="cursor-pointer py-1 px-2"
                      onClick={() => {
                        handleStrikeChange(s);
                        setStrikeSelectOpen(false);
                      }}
                    >
                      <P3 className="font-semibold">${s}</P3>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {!!price && (
            <div className="bg-[#2B2005] p-3 flex gap-3">
              <div>
                <P4 className="text-dark-secondary">
                  Price for protecting 1{" "}
                  <span className="font-bold">{token.symbol}</span> if it{" "}
                  <span className="font-bold">
                    drops below ${currentStrike}
                  </span>{" "}
                  till{" "}
                  <span className="font-bold">
                    {date} {time}
                  </span>
                </P4>
                <div className="flex gap-3 items-baseline">
                  <P3 className="font-semibold">
                    {formatNumber(price.val, price.val < 1 ? 5 : 2)} USDC
                  </P3>
                  <P4 className="text-dark-secondary">
                    ${formatNumber(price.val, price.val < 1 ? 5 : 2)}
                  </P4>
                </div>
              </div>
              <div className="content-center pt-1">
                <LightBulb width="12px" height="12px" />
              </div>
            </div>
          )}
          {(!!price || priceLoading) && <Divider />}
          {(!!price || priceLoading) && (
            <div className="flex justify-between">
              <P4 className="font-semibold text-dark-secondary">
                Final protection price
              </P4>
              {priceLoading || price === undefined ? (
                <div className="h-8">
                  <LoadingAnimation />
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <H6>{formatNumber(price.val, price.val < 1 ? 5 : 2)} USDC</H6>
                  <P4 className="text-dark-secondary">
                    ${formatNumber(price.val, price.val < 1 ? 5 : 2)}
                  </P4>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-3">
            {(!!price || priceLoading) && <Divider />}
            {(!!price || priceLoading) && (
              <div className="flex justify-between">
                <P4 className="font-semibold text-dark-secondary">Balance</P4>
                <P4 className="font-semibold text-dark-secondary">
                  {displayBalance || "-"} USDC
                </P4>
              </div>
            )}
            <BuyPriceGuardButton />
            {notEnoughFunds && (
              <div className="bg-ui-errorBg rounded-sm p-2 gap-2 flex">
                <div className="pt-2">
                  <Warning />
                </div>
                <div>
                  <P4 className="text-ui-errorAccent">
                    You need{" "}
                    {formatNumber(
                      price.val - floatBalance,
                      price.val - floatBalance < 0 ? 5 : 2
                    )}{" "}
                    USDC more to open this position.
                  </P4>
                  <NavLink
                    to={`/swap`}
                    onClick={closeSidebar}
                    className="underline"
                  >
                    <P4 className="text-ui-errorAccent">Get USDC on AVNU →</P4>
                  </NavLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
