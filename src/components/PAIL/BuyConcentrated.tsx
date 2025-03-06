import { memo } from "react";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";
import { Pair } from "../../classes/Pair";
import { PAIL_ADDRESS } from "../../constants/amm";
import { LoadingAnimation } from "../Loading/Loading";
import { decimalToMath64, math64ToInt } from "../../utils/units";
import { longInteger, shortInteger } from "../../utils/computations";
import { TokenBadge } from "../TokenBadge";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { Button, P3 } from "../common";
import { usePailQuoteConcentrated } from "../../hooks/usePailQuote";
import { debug } from "../../utils/debugger";
import { cubit } from "../../types/units";
import { Call, ProviderInterface } from "starknet";
import { BalanceDisplay } from "./BalanceDisplay";

type Props = {
  tokenPair: Pair;
  tokenPrice: number;
  expiry: number;
  notional: number;
  priceAt: number;
  rangeLeft: number;
  rangeRight: number;
  address?: string;
  baseBalance?: number;
  quoteBalance?: number;
  provider: ProviderInterface;
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>;
};

export const BuyConcentrated = ({
  tokenPair,
  tokenPrice,
  expiry,
  notional,
  priceAt,
  rangeLeft,
  rangeRight,
  address,
  baseBalance,
  quoteBalance,
  provider,
  sendAsync,
}: Props) => {
  const { isLoading, isError, error, pailQuoteAmm } = usePailQuoteConcentrated({
    notional,
    baseToken: tokenPair.baseToken,
    quoteToken: tokenPair.quoteToken,
    maturity: expiry,
    pricedAt: priceAt,
    rangeLeft,
    rangeRight,
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || pailQuoteAmm === undefined) {
    console.error(error);
    return <div>Something went wrong</div>;
  }

  const quotePriceMath64 = (pailQuoteAmm[0] as cubit).mag;
  const basePriceMath64 = (pailQuoteAmm[1] as cubit).mag;
  const pricedAtMath64 = (pailQuoteAmm[2] as cubit).mag;
  const quotePrice = math64ToInt(
    quotePriceMath64,
    tokenPair.quoteToken.decimals
  );
  const basePrice = math64ToInt(basePriceMath64, tokenPair.baseToken.decimals);

  const handleBuy = async () => {
    const slippage = 20; // currently 20% slipapge for testing

    const applySlippage = (n: bigint) => {
      return ((n * BigInt(100 + slippage)) / 100n).toString(10);
    };

    const approveQuote = {
      contractAddress: tokenPair.quoteToken.address,
      entrypoint: "approve",
      calldata: [PAIL_ADDRESS, applySlippage(BigInt(quotePrice) + 1n), "0"],
    };
    const approveBase = {
      contractAddress: tokenPair.baseToken.address,
      entrypoint: "approve",
      calldata: [PAIL_ADDRESS, applySlippage(BigInt(basePrice) + 1n), "0"],
    };

    const call = {
      contractAddress: PAIL_ADDRESS,
      entrypoint: "clmm_hedge_open",
      calldata: [
        longInteger(notional, tokenPair.baseToken.decimals).toString(10),
        tokenPair.quoteToken.address,
        tokenPair.baseToken.address,
        expiry,
        applySlippage(quotePriceMath64),
        0,
        applySlippage(basePriceMath64),
        0,
        decimalToMath64(rangeLeft),
        0,
        decimalToMath64(rangeRight),
        0,
        pricedAtMath64.toString(10),
        0,
      ],
    };

    debug("PAIL buy", { approveBase, approveQuote, call, rangeRight });

    await sendAsync([approveQuote, approveBase, call])
      .then(({ transaction_hash }) => {
        toast.promise(provider.waitForTransaction(transaction_hash), {
          loading: "Waiting for PAIL tx to finish...",
          success: "PAIL successful!",
          error: "PAIL failed!",
        });
      })
      .catch(() => {
        toast.error("Failed to open PAIL position");
      });
  };

  return (
    <BuyView
      pair={tokenPair}
      tokenPrice={tokenPrice}
      basePrice={shortInteger(basePrice, tokenPair.baseToken.decimals)}
      quotePrice={shortInteger(quotePrice, tokenPair.quoteToken.decimals)}
      pricedAt={priceAt}
      address={address}
      baseBalance={baseBalance}
      quoteBalance={quoteBalance}
      handleBuy={handleBuy}
    />
  );
};

type BuyViewProps = {
  pair: Pair;
  tokenPrice: number;
  basePrice: number;
  quotePrice: number;
  pricedAt: number;
  address?: string;
  baseBalance?: number;
  quoteBalance?: number;
  handleBuy: () => void;
};

const BuyView = memo(
  ({
    pair,
    tokenPrice,
    basePrice,
    quotePrice,
    pricedAt,
    address,
    baseBalance,
    quoteBalance,
    handleBuy,
  }: BuyViewProps) => {
    const isNotEnoughFunds = !!(
      (baseBalance && basePrice > baseBalance) ||
      (quoteBalance && quotePrice > quoteBalance)
    );

    return (
      <div className="w-fit">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 border-brand border-[1px] rounded-md items-center p-2">
            <div className="flex items-center gap-1">
              <TokenBadge token={pair.quoteToken} />
              {quotePrice.toFixed(4)}
            </div>
            <p>|</p>
            <div className="flex items-center gap-1">
              <TokenBadge token={pair.baseToken} />
              {basePrice.toFixed(4)}
            </div>
            <p>|</p>
            <div className="flex items-center gap-1">
              at 1
              <TokenBadge token={pair.baseToken} />
              {pricedAt === 0
                ? `~${tokenPrice.toFixed(4)} `
                : `~${pricedAt.toFixed(4)} `}
              <TokenBadge token={pair.quoteToken} />
            </div>
          </div>
          <BalanceDisplay pair={pair} base={baseBalance} quote={quoteBalance} />
          {!address && <PrimaryConnectWallet />}
          {isNotEnoughFunds && (
            <div className="w-full">
              {baseBalance && baseBalance < basePrice && (
                <P3 className="text-ui-errorBg">
                  Not enought {pair.baseToken.symbol}
                </P3>
              )}
              {quoteBalance && quoteBalance < quotePrice && (
                <P3 className="text-ui-errorBg">
                  Not enought {pair.quoteToken.symbol}
                </P3>
              )}
            </div>
          )}
          {address && (
            <Button
              onClick={handleBuy}
              disabled={isNotEnoughFunds}
              type="primary"
            >
              Protect Against Impermanent Loss
            </Button>
          )}
        </div>
      </div>
    );
  }
);
