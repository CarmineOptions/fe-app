import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Link,
} from "@mui/material";
import { timestampToReadableDate } from "../../utils/utils";
import { useDialog } from "../../hooks/useDialog";
import { closeDialog } from "../../redux/actions";
import { DialogContentElem } from "../../redux/reducers/ui";
import { WalletBox } from "../ConnectWallet/Content";
import { SlippageContent } from "../Slippage/SlippageContent";
import { Close } from "@mui/icons-material";
import { ClosePosition } from "../ClosePosition/ClosePosition";
import { WalletInfo } from "../WalletInfo/WalletInfo";
import { ReactNode } from "react";
import { BuyInsuranceModal } from "../Insurance/BuyInsuranceModal";
import { TransferDialog } from "../Transfer";

const NetworkMismatch = () => (
  <>
    <DialogTitle id="alert-dialog-title">
      Wallet - dApp network mismatch
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Your wallet appears to be connected to a different network than this
        application. Please ensure that your wallet is connected to the same
        network as the app, or change the network that the app is using, in
        order to proceed.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

const MetamaskMissing = () => (
  <>
    <DialogTitle id="alert-dialog-title">Metamask wallet not found</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        It appears that you do not have the Metamask wallet installed in your
        browser.
        <br />
        In order to stake using Wido, it is necessary to have the Metamask
        wallet.
        <br />
        To install it, please follow the instructions provided at{" "}
        <Link target="_blank" href="https://metamask.io/">
          metamask.io
        </Link>
        .
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

const getNextFridayMidnightUTC = (): string => {
  const today = new Date();
  const currentDay = today.getUTCDay();
  const daysUntilFriday = (5 - currentDay + 7) % 7; // Calculate days until next Friday
  const nextFriday = new Date(today);
  nextFriday.setUTCDate(today.getUTCDate() + daysUntilFriday);
  nextFriday.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
  return timestampToReadableDate(nextFriday.getTime());
};

const NotEnoughUnlocked = () => (
  <>
    <DialogTitle id="alert-dialog-title">
      Not Enough Unlocked Capital
    </DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Unfortunatelly, there is not enough unlocked capital in the AMM. Please
        try again after <strong>{getNextFridayMidnightUTC()}</strong>, when
        options expire and more capital will be unlocked.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <button onClick={closeDialog} autoFocus>
        Close
      </button>
    </DialogActions>
  </>
);

type CustomDialogTitleProps = {
  title: string;
};

export const CustomDialogTitle = ({ title }: CustomDialogTitleProps) => (
  <DialogTitle
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      p: 2,
    }}
  >
    {title}
    <IconButton
      aria-label="close"
      onClick={closeDialog}
      sx={{
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <Close />
    </IconButton>
  </DialogTitle>
);

type Props = {
  children: ReactNode;
};

const Border = ({ children }: Props) => {
  const style = {
    background: "black",
    border: "1px solid white",
    borderRadius: 0,
    overflow: "hidden",
  };

  return <div style={style}>{children}</div>;
};

export const MultiDialog = () => {
  const { dialogOpen, dialogContent } = useDialog();

  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      {dialogContent === DialogContentElem.NetworkMismatch && (
        <Border>
          <NetworkMismatch />
        </Border>
      )}
      {dialogContent === DialogContentElem.Slippage && (
        <Border>
          <SlippageContent />
        </Border>
      )}
      {dialogContent === DialogContentElem.Wallet && (
        <Border>
          <WalletBox />
        </Border>
      )}
      {dialogContent === DialogContentElem.CloseOption && (
        <Border>
          <ClosePosition />
        </Border>
      )}
      {dialogContent === DialogContentElem.BuyInsurance && (
        <Border>
          <BuyInsuranceModal />
        </Border>
      )}
      {dialogContent === DialogContentElem.Account && (
        <Border>
          <WalletInfo />
        </Border>
      )}
      {dialogContent === DialogContentElem.MetamaskMissing && (
        <Border>
          <MetamaskMissing />
        </Border>
      )}
      {dialogContent === DialogContentElem.NotEnoughUnlocked && (
        <Border>
          <NotEnoughUnlocked />
        </Border>
      )}
      {dialogContent === DialogContentElem.TransferCapital && (
        <Border>
          <TransferDialog />
        </Border>
      )}
    </Dialog>
  );
};
