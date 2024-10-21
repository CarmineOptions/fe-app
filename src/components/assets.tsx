import { SxProps } from "@mui/system";
import { Box } from "@mui/material";
import { ConnectedStarknetWindowObject } from "get-starknet-core";

import styles from "./ConnectWallet/button.module.css";

interface IconProps {
  sx?: SxProps;
}

interface WalletIconProps extends IconProps {
  wallet: ConnectedStarknetWindowObject;
}

export const ArgentIcon = ({ sx }: IconProps) => (
  <Box component="img" sx={sx} alt="ArgentX wallet icon" src="argentx.svg" />
);

export const BraavosIcon = ({ sx }: IconProps) => (
  <Box component="img" sx={sx} alt="Braavos wallet icon" src="braavos.svg" />
);

export const WalletIcon = ({ sx, wallet }: WalletIconProps) => {
  return (
    <Box
      sx={sx}
      component="img"
      className={styles.walleticon}
      alt={`${wallet.id} wallet icon`}
      src={wallet.icon}
    />
  );
};
