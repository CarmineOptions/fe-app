import { Modal, Paper, useTheme } from "@mui/material";
import { WalletBox } from "./Content";
import { isDarkTheme } from "../../utils/utils";
import { useWalletConnectDialogOpen } from "../../hooks/useWalletConnectDialogOpen";
import { closeWalletConnectDialog } from "../../redux/actions";

export const WalletModal = () => {
  const open = useWalletConnectDialogOpen();

  const theme = useTheme();
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    margin: 2,
    padding: 2,
    maxWidth: 600,
    minWidth: 300,
    background: isDarkTheme(theme) ? "black" : "white",
    border: `solid 1px ${theme.palette.primary.main}`,
  };
  return (
    <Modal
      open={open}
      onClose={closeWalletConnectDialog}
      aria-labelledby="wallet connection modal"
      aria-describedby="choose a wallet and connect to it"
    >
      <Paper sx={style} elevation={2}>
        <WalletBox />
      </Paper>
    </Modal>
  );
};
