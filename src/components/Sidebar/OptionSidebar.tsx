import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { Tooltip } from "@mui/material";

import { PairNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useCurrency } from "../../hooks/useCurrency";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
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
import { setSidebarContent } from "../../redux/actions";
import { approveAndTradeOpenNew } from "../../calls/tradeOpen";
import { OptionSidebarSuccess } from "./OptionSidebarSuccess";

import { getProfitGraphData } from "../CryptoGraph/profitGraphData";
import { ProfitGraph } from "../CryptoGraph/ProfitGraph";
import { Button, Divider, P3, P4 } from "../common";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";

type Props = {
  option: OptionWithPremia;
};

export const OptionSidebar = ({ option }: Props) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const price = useCurrency(option.underlying.id);
  const { data: balanceRaw } = useUserBalance(option.underlying.address);
  const defaultAmount =
    option.baseToken.id === TokenKey.BTC ||
    option.quoteToken.id === TokenKey.BTC
      ? 0.1
      : 1;
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [amountText, setAmountText] = useState<string>(
    defaultAmount.toString()
  );
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
    if (!address) {
      debug(LogTypes.WARN, "No address", address);
      return;
    }

    if (balanceRaw === undefined || premiaMath64 === undefined) {
      debug(LogTypes.WARN, "No user balance");
      return;
    }

    if (!amount) {
      toast.error("Cannot trade size 0");
      return;
    }

    const callback = (tx: string) => {
      setSidebarContent(
        <OptionSidebarSuccess option={option} tx={tx} amount={amount} />
      );
    };

    approveAndTradeOpenNew(
      address,
      sendAsync,
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
      fetchModalData(size, option, address, controller.signal)
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
    // sets default amounts when option changes
    setAmount(defaultAmount);
    setAmountText(defaultAmount.toString());
    setTxState(TransactionState.Initial);
  }, [defaultAmount, option.optionId]);

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
  const unlimited = "UNLIMITED";
  const breakEven =
    sizeOnePremia === undefined || price === undefined
      ? "--"
      : `${option.quoteToken.id === TokenKey.USDC ? "$" : ""}` +
        formatNumber(
          option.isCall
            ? option.strike + sizeOnePremia * price
            : option.strike - sizeOnePremia * price,
          2
        ) +
        `${
          option.quoteToken.id === TokenKey.USDC ? "" : option.quoteToken.symbol
        }`;

  return (
    <div className="bg-dark-card py-10 px-5 flex flex-col gap-7 h-full">
      <div className="flex flex-col gap-2">
        <PairNamedBadge tokenA={option.baseToken} tokenB={option.quoteToken} />
        <div
          className={`rounded-sm py-[2px] px-3 w-fit uppercase ${
            option.isLong
              ? "bg-ui-successBg text-ui-successAccent"
              : "bg-ui-errorBg text-ui-errorAccent"
          }`}
        >
          <P3 className="font-semibold">{option.sideAsText}</P3>
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
            {loading || !premia || !price ? (
              <div className="h-[40.5px] w-[40.5px]">
                <LoadingAnimation size={25} />
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <P3 className="font-semibold">
                  {`${formatNumber(premia, 4)} ${option.underlying.symbol}`}
                </P3>
                <P4 className="text-dark-secondary font-bold">{`$${formatNumber(
                  price * premia,
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
            disabled={txState === TransactionState.Processing}
            onClick={handleBuy}
            className="h-8 w-full"
            type={
              txState === TransactionState.Success
                ? "success"
                : txState === TransactionState.Fail
                ? "error"
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
            <P3 className="font-semibold">${option.strike}</P3>
            <P4 className="text-dark-secondary font-bold">
              1 {option.baseToken.symbol} = ${option.strike}
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
          {graphData && <ProfitGraph data={graphData} />}
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
              1 {option.baseToken.symbol} = {breakEven}
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
                  {amount === 0
                    ? "--"
                    : `${amount * (option.isPut ? option.strike : 1)} ${
                        option.underlying.symbol
                      }`}
                </P3>
                <P4 className="text-dark-secondary font-bold">
                  $
                  {price === undefined || amount === 0
                    ? "--"
                    : formatNumber(
                        price * amount * (option.isPut ? option.strike : 1)
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
