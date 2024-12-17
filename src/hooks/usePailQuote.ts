import { useReadContract } from "@starknet-react/core";
import { PAIL_ADDRESS } from "../constants/amm";
import { Token } from "../classes/Token";
import { longInteger } from "../utils/computations";
import { decimalToMath64 } from "../utils/units";

interface UsePailQuoteAMMInput {
  notional: number;
  baseToken: Token;
  quoteToken: Token;
  maturity: number;
  pricedAt: number;
}

export const usePailQuoteAMM = ({
  notional,
  baseToken,
  quoteToken,
  maturity,
  pricedAt,
}: UsePailQuoteAMMInput) => {
  const { data: pailQuoteAmm, ...rest } = useReadContract({
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
    args: [
      longInteger(notional, baseToken.decimals).toString(10),
      quoteToken.address,
      baseToken.address,
      maturity.toString(10),
      decimalToMath64(pricedAt),
      0,
    ],
    refetchInterval: 5000,
  });

  return {
    pailQuoteAmm,
    ...rest,
  };
};
