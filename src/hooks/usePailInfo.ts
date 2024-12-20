import { useReadContract } from "@starknet-react/core";
import { PAIL_NFT_ADDRESS } from "../constants/amm";
import { Token } from "../classes/Token";

type PailTokenInfoData = {
  base: Token;
  quote: Token;
  maturity: number;
};

type PailTokenInfoResult = {
  data?: PailTokenInfoData;
  isLoading: boolean;
  isError: boolean;
};

export const usePailTokenInfo = (id: number): PailTokenInfoResult => {
  const {
    data: maturity,
    isLoading: maturityLoading,
    isError: maturityError,
  } = useReadContract({
    abi: [
      {
        name: "maturity",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "maturity",
    address: PAIL_NFT_ADDRESS as `0x${string}`,
    args: [id],
  });

  const {
    data: base,
    isLoading: baseLoading,
    isError: baseError,
  } = useReadContract({
    abi: [
      {
        name: "base_token_address",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "base_token_address",
    address: PAIL_NFT_ADDRESS as `0x${string}`,
    args: [id],
  });

  const {
    data: quote,
    isLoading: quoteLoading,
    isError: quoteError,
  } = useReadContract({
    abi: [
      {
        name: "quote_token_address",
        type: "function",
        inputs: [
          {
            name: "token_id",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "quote_token_address",
    address: PAIL_NFT_ADDRESS as `0x${string}`,
    args: [id],
  });

  const isError = maturityError || baseError || quoteError;
  const isLoading =
    !isError && (maturityLoading || baseLoading || quoteLoading);

  if (isError || isLoading) {
    return { data: undefined, isError, isLoading };
  }

  if (!maturity || !base || !quote) {
    return { data: undefined, isError, isLoading };
  }

  const numMaturity = Number(maturity as bigint);
  const baseToken = Token.byAddress(base as string);
  const quoteToken = Token.byAddress(quote as string);

  if (!numMaturity || !baseToken || !quoteToken) {
    return { data: undefined, isError, isLoading };
  }

  return {
    data: { quote: quoteToken, base: baseToken, maturity: numMaturity },
    isLoading,
    isError,
  };
};