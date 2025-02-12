import { useReadContract } from "@starknet-react/core";
import { PAIL_ADDRESS } from "../constants/amm";
import { Token } from "../classes/Token";
import { longInteger } from "../utils/computations";
import { decimalToMath64 } from "../utils/units";
import { Cubit } from "../types/units";

interface UsePailQuoteAMMInput {
  notional: number;
  baseToken: Token;
  quoteToken: Token;
  maturity: number;
  pricedAt: number;
}

interface UsePailQuoteConcentratedInput {
  notional: number;
  baseToken: Token;
  quoteToken: Token;
  maturity: number;
  pricedAt: number;
  rangeLeft: number;
  rangeRight: number;
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
      longInteger(notional, baseToken.decimals).toString(
        10
      ) as unknown as bigint, // this is necessary because bigint fails on some browsers and app will fail building if string is passed as value
      quoteToken.address,
      baseToken.address,
      maturity,
      decimalToMath64(pricedAt) as unknown as bigint, // same as above
      0,
    ],
    refetchInterval: 5000,
  });

  return {
    pailQuoteAmm,
    ...rest,
  };
};

export const usePailQuoteConcentrated = ({
  notional,
  baseToken,
  quoteToken,
  maturity,
  pricedAt,
  rangeLeft,
  rangeRight,
}: UsePailQuoteConcentratedInput) => {
  const { data: pailQuoteAmm, ...rest } = useReadContract({
    abi: [
      {
        name: "cubit::f128::types::fixed::Fixed",
        type: "struct",
        members: [
          {
            name: "mag",
            type: "core::integer::u128",
          },
          {
            name: "sign",
            type: "core::bool",
          },
        ],
      },
      {
        name: "price_concentrated_hedge",
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
            name: "tick_lower_bound",
            type: "cubit::f128::types::fixed::Fixed",
          },
          {
            name: "tick_upper_bound",
            type: "cubit::f128::types::fixed::Fixed",
          },
          {
            name: "hedge_at_price",
            type: "cubit::f128::types::fixed::Fixed",
          },
        ],
        outputs: [
          {
            type: "(cubit::f128::types::fixed::Fixed, cubit::f128::types::fixed::Fixed, cubit::f128::types::fixed::Fixed, cubit::f128::types::fixed::Fixed, cubit::f128::types::fixed::Fixed)",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "price_concentrated_hedge",
    address: PAIL_ADDRESS as `0x${string}`,
    args: [
      longInteger(notional, baseToken.decimals).toString(
        10
      ) as unknown as bigint, // this is necessary because bigint fails on some browsers and app will fail building if string is passed as value
      quoteToken.address,
      baseToken.address,
      maturity,
      {
        mag: decimalToMath64(rangeLeft) as unknown as bigint, // same as above
        sign: false,
      },
      Cubit(decimalToMath64(rangeRight)),
      Cubit(decimalToMath64(pricedAt)),
    ],
    refetchInterval: 5000,
    enabled: !!rangeLeft && !!rangeRight && rangeRight > rangeLeft,
  });

  return {
    pailQuoteAmm,
    ...rest,
  };
};
