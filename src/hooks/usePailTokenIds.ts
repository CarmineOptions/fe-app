import { useAccount, useReadContract } from "@starknet-react/core";
import { Uint256 } from "starknet";
import { PAIL_NFT_ADDRESS } from "../constants/amm";
import { toHex } from "../utils/utils";

type PailRawData = {
  maturity: number | bigint;
  base: string;
  quote: string;
  id: number | bigint | Uint256;
};

export type PailTokenDesc = {
  maturity: number;
  base: string;
  quote: string;
  id: number;
};

const pailResponseToTokens = (d: PailRawData[]): PailTokenDesc[] => {
  return d.map((v) => ({
    maturity: Number(v.maturity),
    base: toHex(v.base),
    quote: toHex(v.quote),
    id: Number(v.id),
  }));
};

export const usePailTokens = () => {
  const { address } = useAccount();
  const res = useReadContract({
    abi: [
      {
        name: "hoil::hedge_token::HedgeInfo",
        type: "struct",
        members: [
          {
            name: "maturity",
            type: "core::integer::u64",
          },
          {
            name: "base",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "quote",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "id",
            type: "core::integer::u256",
          },
        ],
      },
      {
        name: "get_all_hedges",
        type: "function",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::array::Array::<hoil::hedge_token::HedgeInfo>",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "get_all_hedges",
    address: PAIL_NFT_ADDRESS as `0x${string}`,
    args: [address!],
    enabled: !!address,
    refetchInterval: 5,
  });

  if (res.data !== undefined) {
    return { ...res, data: pailResponseToTokens(res.data) };
  }
  return { ...res, data: undefined };
};
