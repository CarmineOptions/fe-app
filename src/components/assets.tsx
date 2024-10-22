import { SxProps } from "@mui/system";
import { Box } from "@mui/material";

import styles from "./ConnectWallet/button.module.css";
import { Connector } from "@starknet-react/core";

interface IconProps {
  sx?: SxProps;
}

interface WalletIconProps extends IconProps {
  wallet: Connector;
}

export const ArgentIcon = ({ sx }: IconProps) => (
  <Box component="img" sx={sx} alt="ArgentX wallet icon" src="argentx.svg" />
);

export const BraavosIcon = ({ sx }: IconProps) => (
  <Box component="img" sx={sx} alt="Braavos wallet icon" src="braavos.svg" />
);

export const WalletIcon = ({ sx, wallet }: WalletIconProps) => {
  const icon = typeof wallet.icon === "string" ? wallet.icon : wallet.icon.dark;

  return (
    <Box
      sx={sx}
      component="img"
      className={styles.walleticon}
      alt={`${wallet.id} wallet icon`}
      src={icon}
    />
  );
};
