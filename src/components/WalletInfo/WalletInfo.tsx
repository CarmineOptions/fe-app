import { ContentCopy, Info, PowerSettingsNew } from "@mui/icons-material";
import { IconButton, Link, Skeleton, Tooltip, Typography } from "@mui/material";

import {
  closeDialog,
  showToast,
  transferDialogEnable,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { WalletIcon } from "../assets";
import { RecentTransaction } from "./RecentTransactions";
import styles from "./walletinfo.module.css";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useDomain } from "../../hooks/useDomain";

const handleCopy = (msg: string) => {
  navigator.clipboard
    .writeText(msg)
    .then(() => showToast("Address copied!"))
    .catch(() => showToast("Failed to copy", ToastType.Warn));
};

const iconStyle = {
  width: 30,
  marginRight: 1,
};

const buttonStyle = {
  opacity: "70%",
  scale: "80%",
  minWidth: 0,
};

export const WalletInfo = () => {
  const { account, address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { username } = useDomain();

  if (!account || !address || !connector) {
    return <Skeleton width={256} height={88} />;
  }

  const explorerUrl = getStarkscanUrl({ contractHash: address });

  const handleDisconnect = () => {
    closeDialog();
    disconnect();
    transferDialogEnable();
  };

  return (
    <div>
      <div className={styles.header}>
        <Tooltip title={address}>
          <div className={styles.account} onClick={() => handleCopy(address)}>
            <WalletIcon sx={iconStyle} wallet={connector} />
            <Typography sx={{ opacity: "70%" }}>
              {username === undefined ? addressElision(address) : username}
            </Typography>
          </div>
        </Tooltip>

        <Tooltip title="Copy address">
          <IconButton sx={buttonStyle} onClick={() => handleCopy(address)}>
            <ContentCopy />
          </IconButton>
        </Tooltip>

        <Tooltip title="Explore">
          <Link target="_blank" href={explorerUrl} rel="noreferrer">
            <IconButton sx={buttonStyle}>
              <Info />
            </IconButton>
          </Link>
        </Tooltip>

        <Tooltip title="Disconnect">
          <IconButton sx={buttonStyle} onClick={handleDisconnect}>
            <PowerSettingsNew />
          </IconButton>
        </Tooltip>
      </div>
      <div>
        <h4 className={styles.title}>Recent transactions</h4>
      </div>
      <RecentTransaction />
    </div>
  );
};
