import { AccountInterface } from "starknet";
import { AMM_ADDRESS, GOVERNANCE_ADDRESS } from "../../constants/amm";
import { debug } from "../../utils/debugger";

export const proposeOptions = async (
  options: string[],
  account: AccountInterface
) => {
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "submit_custom_proposal",
    calldata: [
      "0x2", // add options custom proposal prop id
      options.length + 2, // length of the payload Span<felt252>
      AMM_ADDRESS,
      options.length / 11, // length of the array of options (each option is 11 fields)
      ...options,
    ],
  };

  debug("Executing add options proposal:", call);

  await account
    .execute(call)
    .then((res) => debug("Send TX", res.transaction_hash))
    .catch(() => {});
};
