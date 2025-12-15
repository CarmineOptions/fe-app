import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useSendTransaction } from "@starknet-react/core";

import { PairNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { TransactionState } from "../../types/network";
import { formatNumber, timestampToPriceGuardDate } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { Button, Divider, P3, P4 } from "../common";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { useDebounce } from "../../hooks/useDebounce";
import { tradeClose } from "../../calls/tradeClose";
import { useTokenPrice } from "../../hooks/usePrice";
import { OptionWithUserPosition } from "@carmine-options/sdk/core";
import { usePremia } from "../../hooks/usePremia";

type Props = {
  option: OptionWithUserPosition;
};

export const ClosePosition = ({ option }: Props) => {
  const { sendAsync } = useSendTransaction({});
  const { address } = useAccount();
  const price = useTokenPrice(option.underlying.symbol);
  const [shouldReset, setShouldReset] = useState<boolean>(false);
  const sizeHuman = option.underlying.toHumanReadable(option.size);
  const [amount, setAmount] = useState<number>(sizeHuman);
  const [amountText, setAmountText] = useState<string>(sizeHuman.toString(10));
  const [txState, setTxState] = useState<TransactionState>(
    TransactionState.Initial
  );
  const debouncedAmount = useDebounce<number>(amount);

  const {
    data: premia,
    isLoading,
    isFetching,
  } = usePremia(option, debouncedAmount, true);

  if (shouldReset) {
    setAmount(sizeHuman);
    setAmountText(sizeHuman.toString(10));
    setShouldReset(false);
  }

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      if (n > sizeHuman) {
        return sizeHuman;
      }
      return n;
    }
  );

  const handleClose = () => {
    if (!address || !premia) {
      toast.error("Cannot close size 0");
      return;
    }

    tradeClose(sendAsync, option, premia, amount);
  };

  useEffect(() => {
    setShouldReset(true);
    setTxState(TransactionState.Initial);
  }, [option.optionId]);

  const [date, time] = timestampToPriceGuardDate(option.maturity);

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
            {isLoading || isFetching || !premia || !price ? (
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
            disabled={txState === TransactionState.Processing}
            onClick={handleClose}
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
              "Close"
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
    </div>
  );
};
