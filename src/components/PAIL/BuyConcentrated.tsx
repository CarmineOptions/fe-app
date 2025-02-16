import { memo } from "react";
import {
  useAccount,
  useProvider,
  useSendTransaction,
} from "@starknet-react/core";
import toast from "react-hot-toast";
import { Pair } from "../../classes/Pair";
import { PAIL_ADDRESS } from "../../constants/amm";
import { LoadingAnimation } from "../Loading/Loading";
import { decimalToMath64, math64ToInt } from "../../utils/units";
import { longInteger, shortInteger } from "../../utils/computations";
import { TokenBadge } from "../TokenBadge";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { Button } from "../common";
import { Token } from "../../classes/Token";
import { usePailQuoteConcentrated } from "../../hooks/usePailQuote";
import { debug } from "../../utils/debugger";
import { cubit } from "../../types/units";

type Props = {
  tokenPair: Pair;
  expiry: number;
  notional: number;
  priceAt: number;
  rangeLeft: number;
  rangeRight: number;
};

export const BuyConcentrated = ({
  tokenPair,
  expiry,
  notional,
  priceAt,
  rangeLeft,
  rangeRight,
}: Props) => {
  const { address } = useAccount();
  const { provider } = useProvider();
  const { isLoading, isError, error, pailQuoteAmm } = usePailQuoteConcentrated({
    notional,
    baseToken: tokenPair.baseToken,
    quoteToken: tokenPair.quoteToken,
    maturity: expiry,
    pricedAt: priceAt,
    rangeLeft,
    rangeRight,
  });
  const { sendAsync } = useSendTransaction({});

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
      baseToken={tokenPair.baseToken}
      quoteToken={tokenPair.quoteToken}
      basePrice={shortInteger(basePrice, tokenPair.baseToken.decimals)}
      quotePrice={shortInteger(quotePrice, tokenPair.quoteToken.decimals)}
      pricedAt={priceAt}
      address={address}
      handleBuy={handleBuy}
    />
  );
};

type BuyViewProps = {
  baseToken: Token;
  quoteToken: Token;
  basePrice: number;
  quotePrice: number;
  pricedAt: number;
  address?: string;
  handleBuy: () => void;
};

const BuyView = memo(
  ({
    baseToken,
    quoteToken,
    basePrice,
    quotePrice,
    pricedAt,
    address,
    handleBuy,
  }: BuyViewProps) => {
    return (
      <div className="w-fit">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 border-brand border-[1px] rounded-md items-center p-2">
            <div className="flex items-center gap-1">
              <TokenBadge token={quoteToken} />
              {quotePrice.toFixed(4)}
            </div>
            <p>|</p>
            <div className="flex items-center gap-1">
              <TokenBadge token={baseToken} />
              {basePrice.toFixed(4)}
            </div>
            <p>|</p>
            <div className="flex items-center gap-1">
              at 1
              <TokenBadge token={baseToken} />~{pricedAt.toFixed(4)}{" "}
              <TokenBadge token={quoteToken} />
            </div>
          </div>
          {address ? (
            <Button onClick={handleBuy} type="primary">
              Protect Against Impermanent Loss
            </Button>
          ) : (
            <PrimaryConnectWallet />
          )}
        </div>
      </div>
    );
  }
);
