import { TransferState, transferLpCapital, userLpBalance } from "./transfer";
import { useAccount } from "../../hooks/useAccount";
import { useState } from "react";

export const TransferButton = () => {
  const account = useAccount();
  const [txState, setTxState] = useState(TransferState.Initial);

  const handleClick = async () => {
    if (!account) {
      return;
    }
    const transferData = await userLpBalance(account.address);

    if (transferData.shouldTransfer) {
      transferLpCapital(account, transferData, setTxState);
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
