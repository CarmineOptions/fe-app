import { Call } from "starknet";
import { GOVERNANCE_ADDRESS } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import { RequestResult } from "@starknet-react/core";

export const proposeOptions = async (
  payload: (string | number)[],
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>
) => {
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "submit_custom_proposal",
    calldata: payload,
  };

  debug("Executing add options proposal:", call);

  await sendAsync([call])
    .then((res) => debug("Send TX", res.transaction_hash))
    .catch(() => {});
};
