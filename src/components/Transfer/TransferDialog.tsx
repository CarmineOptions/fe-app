import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { closeDialog } from "../../redux/actions";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { shortInteger } from "../../utils/computations";
import { useState } from "react";
import { TransferState, transferLpCapital } from "./transfer";
import { useAccount } from "../../hooks/useAccount";

export const TransferDialog = () => {
  const account = useAccount();
  const transferData = useSelector((s: RootState) => s.ui.transferData);
  const [txState, setTxState] = useState(TransferState.Initial);

  const handleClick = () => {
    if (transferData && account) {
      transferLpCapital(account, transferData, setTxState);
    }
  };

  return (
    <>
      <DialogTitle id="alert-dialog-title">Transfer Capital</DialogTitle>
      {txState === TransferState.Initial && (
        <>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You currently have capital staked in the old Carmine Options
              Liquidity Pool:
            </DialogContentText>
            <div style={{ padding: "1rem" }}>
              <ul>
                {transferData?.call && (
                  <li>
                    {shortInteger(transferData.call.value, 18).toFixed(4)} ETH
                    in the ETH/USDC Call Pool
                  </li>
                )}
                {transferData?.put && (
                  <li>
                    {shortInteger(transferData.put.value, 6).toFixed(4)}
                    USDC in the ETH/USDC Put Pool.
                  </li>
                )}
              </ul>
            </div>
            <DialogContentText>
              Please, transfer the capital to the new AMM protocol by clicking
              the button bellow.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button onClick={handleClick} autoFocus>
              Transfer Capital
            </button>
          </DialogActions>
        </>
      )}
      {txState === TransferState.Processing && (
        <>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Please, follow the instructions in your wallet.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button onClick={closeDialog} autoFocus>
              Close
            </button>
          </DialogActions>
        </>
      )}
      {txState === TransferState.Success && (
        <>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Your capital has been successfully transfered!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button onClick={closeDialog} autoFocus>
              Close
            </button>
          </DialogActions>
        </>
      )}
      {txState === TransferState.Fail && (
        <>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Something went wrong, please try again later.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <button onClick={closeDialog} autoFocus>
              Close
            </button>
          </DialogActions>
        </>
      )}
    </>
  );
};
