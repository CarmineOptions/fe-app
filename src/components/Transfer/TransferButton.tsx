import { TransferState, transferLpCapital, userLpBalance } from "./transfer";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { useState } from "react";

export const TransferButton = () => {
  const { address } = useAccount();
  const { sendAsync } = useSendTransaction({});
  const [txState, setTxState] = useState(TransferState.Initial);

  const handleClick = async () => {
    if (!address) {
      return;
    }
    const transferData = await userLpBalance(address);

    if (transferData.shouldTransfer) {
      transferLpCapital(sendAsync, transferData, setTxState);
    }
  };

  return (
    <div style={{ margin: "1rem" }}>
      {txState === TransferState.Initial && (
        <button onClick={handleClick}>CLICK ME!</button>
      )}
      {txState === TransferState.Processing && (
        <button disabled={true}>Working...</button>
      )}
      {txState === TransferState.Success && (
        <button disabled={true}>All done!</button>
      )}
      {txState === TransferState.Fail && (
        <button disabled={true}>Failed, please try again</button>
      )}
    </div>
  );
};
