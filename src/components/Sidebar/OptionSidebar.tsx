import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { Tooltip } from "@mui/material";

import { PairNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useTokenPrice } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { TransactionState } from "../../types/network";
import { formatNumber, timestampToPriceGuardDate } from "../../utils/utils";
import { debug, LogTypes } from "../../utils/debugger";
import { LoadingAnimation } from "../Loading/Loading";
import { closeSidebar, setSidebarContent } from "../../redux/actions";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import { OptionSidebarSuccess } from "./OptionSidebarSuccess";

import { getProfitGraphData } from "../CryptoGraph/profitGraphData";
import { ProfitGraph } from "../CryptoGraph/ProfitGraph";
import { Button, Divider, P3, P4 } from "../common";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { NavLink } from "react-router-dom";
import { Warning } from "../Icons";
import { OptionWithPremia } from "carmine-sdk/core";
import { usePremia } from "../../hooks/usePremia";
import { useDebounce } from "../../hooks/useDebounce";

type Props = {
  option: OptionWithPremia;
};

export const OptionSidebar = ({ option }: Props) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const price = useTokenPrice(option.underlying);
  const { data: balanceRaw } = useUserBalance(option.underlying.address);
  const defaultSize = [option.base.symbol, option.quote.symbol].includes("wBTC")
    ? 0.1
    : 1;
  const [size, setSize] = useState<number>(defaultSize);
  const debouncedSize = useDebounce(size, 400);

  const [amountText, setAmountText] = useState<string>(defaultSize.toString());

  const { data: premia } = usePremia(option, debouncedSize, false);
  const sizeOnePremia = premia ? premia.val / debouncedSize : undefined;
  const premiaUsd = premia && price ? premia.val * price : undefined;
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.Initial
  );

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setSize,
    (n) => {
      return n;
    }
  );

  const handleBuy = () => {
    if (!address) {
      debug(LogTypes.WARN, "No address", address);
      return;
    }

    console.log({ balanceRaw, premia });

    if (balanceRaw === undefined || premia === undefined) {
      debug(LogTypes.WARN, "No user balance");
      return;
    }

    if (!debouncedSize) {
      toast.error("Cannot trade size 0");
      return;
    }

    const callback = (tx: string) => {
      setSidebarContent(
        <OptionSidebarSuccess option={option} tx={tx} size={debouncedSize} />
      );
    };

    approveAndTradeOpenNew(
      address,
      sendAsync,
      option,
      debouncedSize,
      premia,
      balanceRaw,
      setTxState,
      false, // not priceguard
      callback // open success sidebar when done
    ).catch(() => setTxState(TransactionState.Fail));
  };

  useEffect(() => {
    // sets default amounts when option changes
    setSize(defaultSize);
    setAmountText(defaultSize.toString());
    setTxState(TransactionState.Initial);
  }, [defaultSize, option.optionId]);

  const balance =
    balanceRaw === undefined
      ? undefined
      : shortInteger(balanceRaw, option.underlying.decimals);

  const [date, time] = timestampToPriceGuardDate(option.maturity);

  const graphData =
    premiaUsd === undefined || size === 0
      ? undefined
      : getProfitGraphData(option, premiaUsd, debouncedSize);

  const limited =
    premia === undefined
      ? "--"
      : formatNumber(premia.val, 4) + " " + option.underlying.symbol;
  const limitedUsd =
    premiaUsd === undefined ? "--" : "$" + formatNumber(premiaUsd, 4);
  const unlimited = "UNLIMITED";
  const breakEven =
    sizeOnePremia === undefined || price === undefined
      ? "--"
      : `${option.quote.symbol === "USDC" ? "$" : ""}` +
        formatNumber(
          option.isCall
            ? option.strikePrice.val + sizeOnePremia * price
            : option.strikePrice.val - sizeOnePremia * price,
          2
        ) +
        `${option.quote.symbol === "USDC" ? "" : option.quote.symbol}`;

  const getRequired = (): number | undefined => {
    if (premia === undefined || debouncedSize === 0) {
      return;
    }
    if (option.isLong) {
      return premia.val;
    }
    const value = option.isPut
      ? debouncedSize * option.strikePrice.val
      : debouncedSize;
    return value - premia.val;
  };

  const required = getRequired();

  const getNotEnoughFunds = (): boolean => {
    if (balance === undefined || required === undefined) {
      return false;
    }

    return required > balance;
  };

  const notEnoughFunds = getNotEnoughFunds();

  return (
    <div className="bg-dark-card py-10 px-5 flex flex-col gap-7 h-full">
      <div className="flex flex-col gap-2">
        <PairNamedBadge tokenA={option.base} tokenB={option.quote} />
        <div
          className={`rounded-sm py-[2px] px-3 w-fit uppercase ${
            option.isLong
              ? "bg-ui-successBg text-ui-successAccent"
              : "bg-ui-errorBg text-ui-errorAccent"
          }`}
        >
          <P3 className="font-semibold">
            {option.optionSide === 0 ? "Long" : "Short"}
          </P3>
        </div>
      </div>
      <div className="flex flex-col gap-[18px]">
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold">Option Size</P3>
            <P4 className="text-dark-secondary">Notional vol.</P4>
          </div>
          <div>
            <input
              onChange={handleChange}
              type="text"
              placeholder="size"
              className="bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2"
              value={amountText}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold">Amount</P3>
          </div>
          <div>
            {!premia || !price ? (
              <div className="h-[40.5px] w-[40.5px]">
                <LoadingAnimation size={25} />
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <P3 className="font-semibold">
                  {`${formatNumber(premia.val, 4)} ${option.underlying.symbol}`}
                </P3>
                <P4 className="text-dark-secondary font-bold">{`$${formatNumber(
                  price * premia.val,
                  4
                )}`}</P4>
              </div>
            )}
          </div>
        </div>
        {address === undefined ? (
          <PrimaryConnectWallet className="w-full" />
        ) : (
          <Button
            disabled={txState === TransactionState.Processing || notEnoughFunds}
            onClick={handleBuy}
            className="h-8 w-full"
            type={
              txState === TransactionState.Success
                ? "success"
                : txState === TransactionState.Fail
                ? "error"
                : notEnoughFunds
                ? "disabled"
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
              "Buy"
            )}
          </Button>
        )}
        {notEnoughFunds && (
          <div className="bg-ui-errorBg rounded-sm p-2 gap-2 flex">
            <div className="pt-2">
              <Warning />
            </div>
            <div>
              <P4 className="text-ui-errorAccent">
                You need{" "}
                {formatNumber(
                  required! - balance!,
                  required! - balance! < 0 ? 5 : 2
                )}{" "}
                {option.underlying.symbol} more to open this position.
              </P4>
              <NavLink
                to={`/swap`}
                onClick={closeSidebar}
                className="underline"
              >
                <P4 className="text-ui-errorAccent">
                  Get {option.underlying.symbol} on AVNU →
                </P4>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <P4 className="font-bold text-dark-tertiary">OPTION INFO</P4>
        <Divider className="grow" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold text-dark-secondary">STRIKE PRICE</P3>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">${option.strikePrice.val}</P3>
            <P4 className="text-dark-secondary font-bold">
              1 {option.base.symbol} = ${option.strikePrice.val}
            </P4>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold text-dark-secondary">MATURITY</P3>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">{date}</P3>
            <P4 className="text-dark-secondary font-bold">{time}</P4>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <P4 className="font-bold text-dark-tertiary">PAYOFF</P4>
        <Divider className="grow" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="w-full h-32 bg-dark">
          {graphData ? <ProfitGraph data={graphData} /> : <LoadingAnimation />}
        </div>
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold text-dark-secondary">MAX PROFIT</P3>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {option.isLong ? unlimited : limited}
            </P3>
            <P4 className="text-dark-secondary font-bold">
              {option.isLong ? "$--" : limitedUsd}
            </P4>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold text-dark-secondary">MAX LOSS</P3>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {option.isLong ? limited : unlimited}
            </P3>
            <P4 className="text-dark-secondary font-bold">
              {option.isLong ? limitedUsd : "$--"}
            </P4>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <P3 className="font-semibold text-dark-secondary">BREAKEVEN</P3>
          </div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">{breakEven}</P3>
            <P4 className="text-dark-secondary font-bold">
              1 {option.base.symbol} = {breakEven}
            </P4>
          </div>
        </div>
      </div>

      {option.isShort && (
        <Tooltip
          placement="top-start"
          title="When shorting, you are locking in the size of the option and receiving the premia."
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <P4 className="font-bold text-dark-tertiary">SHORTING</P4>
              <Divider className="grow" />
            </div>
            <div className="flex justify-between">
              <div>
                <P3 className="font-semibold text-dark-secondary">LOCK IN</P3>
              </div>
              <div className="flex flex-col items-end">
                <P3 className="font-semibold">
                  {debouncedSize === 0
                    ? "--"
                    : `${
                        debouncedSize *
                        (option.isPut ? option.strikePrice.val : 1)
                      } ${option.underlying.symbol}`}
                </P3>
                <P4 className="text-dark-secondary font-bold">
                  $
                  {price === undefined || debouncedSize === 0
                    ? "--"
                    : formatNumber(
                        price *
                          debouncedSize *
                          (option.isPut ? option.strikePrice.val : 1)
                      )}
                </P4>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <P3 className="font-semibold text-dark-secondary">
                  YOUR BALANCE
                </P3>
              </div>
              <div className="flex flex-col items-end">
                <P3 className="font-semibold">
                  {balance === undefined
                    ? "--"
                    : `${formatNumber(balance, 4)} ${option.underlying.symbol}`}
                </P3>
                <P4 className="text-dark-secondary font-bold">
                  $
                  {price === undefined || balance === undefined
                    ? "--"
                    : formatNumber(price * balance)}
                </P4>
              </div>
            </div>
          </div>
        </Tooltip>
      )}
    </div>
  );
};
