import { useReadContract } from "@starknet-react/core";
import { PAIL_NFT_ADDRESS } from "../constants/amm";

export const usePailTokenInfo = (id: number) => {
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

  return {
    data: { quote, base, maturity },
    isLoading,
    isError,
  };
};
