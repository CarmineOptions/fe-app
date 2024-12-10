import {
  useAccount,
  useProvider,
  useReadContract,
  useSendTransaction,
} from "@starknet-react/core";
import { Pair } from "../../classes/Pair";
import { PAIL_ADDRESS } from "../../constants/amm";
import { LoadingAnimation } from "../Loading/Loading";
import { decimalToMath64, math64toDecimal } from "../../utils/units";
import { longInteger } from "../../utils/computations";
import toast from "react-hot-toast";
import { TokenBadge } from "../TokenBadge";
import { PrimaryConnectWallet } from "../ConnectWallet/Button";
import { Button } from "../common";

type Props = {
  tokenPair: Pair;
  expiry: number;
  notional: bigint;
  priceAt: number;
};

export const Buy = ({ tokenPair, expiry, notional, priceAt }: Props) => {
  const { address } = useAccount();
  const { provider } = useProvider();
  const args = [
    notional.toString(10),
    tokenPair.quoteToken.address,
    tokenPair.baseToken.address,
    expiry.toString(10),
    decimalToMath64(priceAt),
    0,
  ];
  const { isLoading, isError, error, data } = useReadContract({
    abi: [
      {
        name: "price_hedge",
        type: "function",
        inputs: [
          {
            name: "notional",
            type: "core::integer::u128",
          },
          {
            name: "quote_token_addr",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "base_token_addr",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "expiry",
            type: "core::integer::u64",
          },
          {
            name: "hedge_at_price",
            type: "core::integer::u128",
          },
          {
            name: "hedge_at_price",
            type: "core::integer::u128",
          },
        ],
        outputs: [
          {
            type: "(core::integer::u128, core::integer::u128, core::integer::u128, core::integer::u128, core::integer::u128, core::integer::u128)",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "price_hedge",
    address: PAIL_ADDRESS as `0x${string}`,
    args,
    refetchInterval: 5000,
  });
  const { sendAsync } = useSendTransaction({});

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || data === undefined) {
    console.error(error);
    return <div>Something went wrong</div>;
  }

  const quotePriceRaw = data[0];
  const basePriceRaw = data[2];
  const quotePrice = math64toDecimal(data[0]);
  const basePrice = math64toDecimal(data[2]);
  const pricedAt = math64toDecimal(data[4]);

  const handleBuy = async () => {
    const approveQuote = {
      contractAddress: tokenPair.quoteToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(quotePrice * 1.05, tokenPair.quoteToken.decimals),
        "0",
      ],
    };
    const approveBase = {
      contractAddress: tokenPair.baseToken.address,
      entrypoint: "approve",
      calldata: [
        PAIL_ADDRESS,
        longInteger(basePrice * 1.05, tokenPair.baseToken.decimals),
        "0",
      ],
    };
    const call = {
      contractAddress: PAIL_ADDRESS,
      entrypoint: "hedge_open",
      calldata: [
        notional.toString(10),
        tokenPair.quoteToken.address,
        tokenPair.baseToken.address,
        expiry,
        ((quotePriceRaw * 105n) / 100n).toString(10),
        0,
        ((basePriceRaw * 105n) / 100n).toString(10),
        0,
        0,
        0,
      ],
    };

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
    <div className="w-fit">
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2 border-brand border-[1px] rounded-md items-center p-2">
          <div className="flex items-center gap-1">
            <TokenBadge token={tokenPair.quoteToken} />
            {quotePrice.toFixed(4)}
          </div>
          <p>|</p>
          <div className="flex items-center gap-1">
            <TokenBadge token={tokenPair.baseToken} />
            {basePrice.toFixed(4)}
          </div>
          <p>|</p>
          <div className="flex items-center gap-1">
            at 1
            <TokenBadge token={tokenPair.baseToken} />~{pricedAt.toFixed(4)}{" "}
            <TokenBadge token={tokenPair.quoteToken} />
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
};
