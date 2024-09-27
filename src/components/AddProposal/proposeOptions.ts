import { AccountInterface } from "starknet";
import { GOVERNANCE_ADDRESS } from "../../constants/amm";

export const proposeOptions = async (
  options: string[],
  account: AccountInterface
) => {
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "submit_custom_proposal",
    calldata: [
      2, // add options custom proposal prop id
      options.length,
      ...options,
    ],
  };

  console.log("Executing add options proposal:", call);

  await account
    .execute(call)
    .then((res) => console.log("Send TX", res.transaction_hash))
    .catch(() => {});
};
