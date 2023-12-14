import { Button, Typography } from "@mui/material";

import { useWallet } from "../../hooks/useWallet";
import { openAccountDialog } from "../../redux/actions";
import { debug } from "../../utils/debugger";
import { addressElision } from "../../utils/utils";
import { WalletIcon } from "../assets";

const iconStyle = {
  width: 30,
  marginRight: 1,
};

const containerStyle = {
  display: "flex",
  alignItems: "center",
};

export const AccountInfo = () => {
  const wallet = useWallet();

  if (!wallet) {
    return null;
  }

  debug(wallet.icon);

  const handleClick = () => {
    openAccountDialog();
  };

  const { account } = wallet;
  const { address } = account;

  return (
    <Button onClick={handleClick} variant="outlined" sx={containerStyle}>
      <>
        <WalletIcon sx={iconStyle} wallet={wallet} />
        <Typography>{addressElision(address)}</Typography>
      </>
    </Button>
  );
};
