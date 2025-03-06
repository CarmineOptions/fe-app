import { memo } from "react";
import { RequestResult } from "@starknet-react/core";
import toast from "react-hot-toast";
import { Pair } from "../../classes/Pair";
import { PAIL_ADDRESS } from "../../constants/amm";
import { LoadingAnimation } from "../Loading/Loading";
import { math64toDecimal } from "../../utils/units";
import { longInteger } from "../../utils/computations";
import { TokenBadge } from "../TokenBadge";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { Button, P3 } from "../common";
import { usePailQuoteAMM } from "../../hooks/usePailQuote";
import { debug } from "../../utils/debugger";
import { ProviderInterface, Call } from "starknet";
import { BalanceDisplay } from "./BalanceDisplay";

type Props = {
  tokenPair: Pair;
  tokenPrice: number;
  expiry: number;
  notional: number;
  priceAt: number;
  address?: string;
  baseBalance?: number;
  quoteBalance?: number;
  provider: ProviderInterface;
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>;
};

export const BuyNonConcentrated = ({
  tokenPair,
  tokenPrice,
  expiry,
  notional,
  priceAt,
  address,
  baseBalance,
  quoteBalance,
  provider,
  sendAsync,
}: Props) => {
  const { isLoading, isError, error, pailQuoteAmm } = usePailQuoteAMM({
    notional,
    baseToken: tokenPair.baseToken,
    quoteToken: tokenPair.quoteToken,
    maturity: expiry,
    pricedAt: priceAt,
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || pailQuoteAmm === undefined) {
    console.error(error);
    return <div>Something went wrong</div>;
  }

  const quotePriceRaw = pailQuoteAmm[0] as bigint;
  const basePriceRaw = pailQuoteAmm[2] as bigint;
  const pricedAtRaw = pailQuoteAmm[4] as bigint;
  const quotePrice = math64toDecimal(quotePriceRaw);
  const basePrice = math64toDecimal(basePriceRaw);

  const handleBuy = async () => {
    const slippage = 20; // currently 20% slipapge for testing
    const approveQuote = {
      contractAddress: tokenPair.quoteToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(
          (quotePrice * (100 + slippage)) / 100,
          tokenPair.quoteToken.decimals
        ).toString(10),
        "0",
      ],
    };
    const approveBase = {
      contractAddress: tokenPair.baseToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(
          (basePrice * (100 + slippage)) / 100,
          tokenPair.baseToken.decimals
        ).toString(10),
        "0",
      ],
    };

    const call = {
      contractAddress: PAIL_ADDRESS,
      entrypoint: "hedge_open",
      calldata: [
        longInteger(notional, tokenPair.baseToken.decimals).toString(10),
        tokenPair.quoteToken.address,
        tokenPair.baseToken.address,
        expiry,
        ((quotePriceRaw * BigInt(100 + slippage) + 1n) / 100n).toString(10),
        0,
        ((basePriceRaw * BigInt(100 + slippage) + 1n) / 100n).toString(10),
        0,
        pricedAtRaw.toString(10),
        0,
      ],
    };

    debug("PAIL buy", { approveBase, approveQuote, call });

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
      basePrice={basePrice}
      quotePrice={quotePrice}
      baseBalance={baseBalance}
      quoteBalance={quoteBalance}
      pricedAt={priceAt}
      address={address}
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
