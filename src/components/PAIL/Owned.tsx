import { useAccount, useReadContract } from "@starknet-react/core";
import { PAIL_NFT_ADDRESS } from "../../constants/amm";
import { LoadingAnimation } from "../Loading/Loading";

export const Owned = () => {
  const { address } = useAccount();
  const idsLen = 12;
  const { isLoading, isError, error, data } = useReadContract({
    abi: [
      {
        name: "balanceOfBatch",
        type: "function",
        inputs: [
          {
            name: "accounts",
            type: "core::array::Span::<core::starknet::contract_address::ContractAddress>",
          },
          {
            name: "tokenIds",
            type: "core::array::Span::<core::integer::u256>",
          },
        ],
        outputs: [
          {
            type: "core::array::Span::<core::integer::u256>",
          },
        ],
        state_mutability: "view",
      },
    ] as const,
    functionName: "balanceOfBatch",
    address: PAIL_NFT_ADDRESS as `0x${string}`,
    args: [
      Array.from({ length: idsLen }, () => address),
      Array.from({ length: idsLen }, (_, i) => i + 1),
    ],
    enabled: !!address,
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }
  if (isError || !data) {
    console.error(error);
    return <p>Something went wrong</p>;
  }

  const userIds = [];

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v > 0n) {
      userIds.push([i + 1, v]);
    }
  }

  console.log(userIds);

  if (userIds.length === 0) {
    return <p>You currently do not hold any PAIL NFTs</p>;
  }

  return (
    <div style={{ display: "flex", flexFlow: "column" }}>
      {userIds.map(([id, value], i) => (
        <div key={i}>
          You hold {value.toString(10)} token id {id}
        </div>
      ))}
    </div>
  );
};
