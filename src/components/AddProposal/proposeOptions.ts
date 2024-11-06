import { Call } from "starknet";
import { AMM_ADDRESS, GOVERNANCE_ADDRESS } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import { RequestResult } from "@starknet-react/core";

export const proposeOptions = async (
  options: string[],
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>
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

  await sendAsync([call])
    .then((res) => debug("Send TX", res.transaction_hash))
    .catch(() => {});
};
