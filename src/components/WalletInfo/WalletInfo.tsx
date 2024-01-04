import { ContentCopy, Info, PowerSettingsNew } from "@mui/icons-material";
import { IconButton, Link, Skeleton, Tooltip, Typography } from "@mui/material";

import { useWallet } from "../../hooks/useWallet";
import { disconnect } from "../../network/account";
import { closeDialog, showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { WalletIcon } from "../assets";
import { RecentTransaction } from "./RecentTransactions";
import styles from "./walletinfo.module.css";

const handleDisconnect = () => {
  closeDialog();
  disconnect();
};

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
};

export const WalletInfo = () => {
  const wallet = useWallet();
  if (!wallet) {
    return <Skeleton width={256} height={88} />;
  }

  const { account } = wallet;
  const { address } = account;
  const exploreUrl = getStarkscanUrl({
    chainId: wallet.account.chainId,
    contractHash: address,
  });

  return (
    <div>
      <div className={styles.header}>
        <Tooltip title={address}>
          <div className={styles.account} onClick={() => handleCopy(address)}>
            <WalletIcon sx={iconStyle} wallet={wallet} />
            <Typography sx={{ opacity: "70%", textTransform: "uppercase" }}>
              {addressElision(address)}
            </Typography>
          </div>
        </Tooltip>

        <Tooltip title="Copy address">
          <IconButton sx={buttonStyle} onClick={() => handleCopy(address)}>
            <ContentCopy />
          </IconButton>
        </Tooltip>

        <Tooltip title="Explore">
          <Link target="_blank" href={exploreUrl} rel="noreferrer">
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
