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
import { decimalToMath64, math64toDecimal } from "../../utils/units";
import { longInteger } from "../../utils/computations";
import { TokenBadge } from "../TokenBadge";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { Button } from "../common";
import { Token } from "../../classes/Token";
import { usePailQuoteAMM } from "../../hooks/usePailQuote";
import { debug } from "../../utils/debugger";

type Props = {
  tokenPair: Pair;
  expiry: number;
  notional: number;
  priceAt: number;
  rangeLeft: number;
  rangeRight: number;
};

export const Buy = ({
  tokenPair,
  expiry,
  notional,
  priceAt,
  rangeLeft,
  rangeRight,
}: Props) => {
  const { address } = useAccount();
  const { provider } = useProvider();
  const { isLoading, isError, error, pailQuoteAmm } = usePailQuoteAMM({
    notional,
    baseToken: tokenPair.baseToken,
    quoteToken: tokenPair.quoteToken,
    maturity: expiry,
    pricedAt: priceAt,
  });
  const { sendAsync } = useSendTransaction({});

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
    const approveQuote = {
      contractAddress: tokenPair.quoteToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(quotePrice * 1.05, tokenPair.quoteToken.decimals).toString(
          10
        ),
        "0",
      ],
    };
    const approveBase = {
      contractAddress: tokenPair.baseToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(basePrice * 1.05, tokenPair.baseToken.decimals).toString(
          10
        ),
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
        ((quotePriceRaw * 105n) / 100n).toString(10),
        0,
        ((basePriceRaw * 105n) / 100n).toString(10),
        0,
        pricedAtRaw,
        0,
      ],
    };

    const cammCall = {
      contractAddress: PAIL_ADDRESS,
      entrypoint: "clmm_hedge_open",
      calldata: [
        longInteger(notional, tokenPair.baseToken.decimals).toString(10),
        tokenPair.quoteToken.address,
        tokenPair.baseToken.address,
        expiry,
        ((quotePriceRaw * 105n) / 100n).toString(10),
        0,
        ((basePriceRaw * 105n) / 100n).toString(10),
        0,
        decimalToMath64(rangeLeft),
        0,
        decimalToMath64(rangeRight),
        0,
        pricedAtRaw.toString(10),
        0,
      ],
    };

    debug("PAIL buy", { approveBase, approveQuote, call, rangeRight });

    await sendAsync([
      approveQuote,
      approveBase,
      rangeRight > 0 ? cammCall : call,
    ])
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
      basePrice={basePrice}
      quotePrice={quotePrice}
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
