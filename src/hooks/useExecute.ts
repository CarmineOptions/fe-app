import { Call } from "starknet";
import { _execute, ExecuteHooks } from "./../utils/blockchain";
import { useProvider, useSendTransaction } from "@starknet-react/core";

export const useExecute = () => {
  const { sendAsync } = useSendTransaction({});
  const { provider } = useProvider();

  const execute = (calls: Call[], hooks?: ExecuteHooks) => {
    if (!sendAsync || !provider) {
      return;
    }
    _execute({ calls, executeFunc: sendAsync, provider, hooks });
  };

  return { execute };
};
