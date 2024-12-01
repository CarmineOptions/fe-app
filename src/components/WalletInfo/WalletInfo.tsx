import { ContentCopy, Info, PowerSettingsNew } from "@mui/icons-material";
import { IconButton, Link, Tooltip } from "@mui/material";

import { closeDialog, transferDialogEnable } from "../../redux/actions";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { WalletIcon } from "../assets";
import { RecentTransaction } from "./RecentTransactions";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useDomain } from "../../hooks/useDomain";
import toast from "react-hot-toast";
import { H4, H5, P3 } from "../common";

const handleCopy = (msg: string) => {
  navigator.clipboard
    .writeText(msg)
    .then(() => toast.success("Address copied!"))
    .catch(() => toast.error("Failed to copy"));
};

const iconStyle = {
  width: 30,
  marginRight: 1,
};

export const WalletInfo = () => {
  const { account, address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { username } = useDomain(address);

  if (!account || !address || !connector) {
    return null;
  }

  const explorerUrl = getStarkscanUrl({ contractHash: address });

  const handleDisconnect = () => {
    closeDialog();
    disconnect();
    transferDialogEnable();
  };

  return (
    <div className="bg-dark-card py-10 px-5 flex flex-col gap-7 h-full">
      <div className="flex flex-col gap-1">
        <H4 className="font-semibold text-dark-primary flex items-center gap-3">
          <WalletIcon sx={iconStyle} wallet={connector} />
          {addressElision(address)}
        </H4>
        {!!username && (
          <div className="p-2 rounded-sm bg-ui-neutralBg w-fit">
            <P3 className="font-semibold text-dark-primary">{username}</P3>
          </div>
        )}
      </div>

      <div className="flex justify-around">
        <Tooltip title="Copy account address">
          <div className="text-dark-primary">
            <IconButton
              sx={{ color: "white" }}
              onClick={() => handleCopy(address)}
            >
              <ContentCopy color="inherit" />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title="Show account on Starkscan">
          <Link target="_blank" href={explorerUrl} rel="noreferrer">
            <IconButton sx={{ color: "white" }}>
              <Info />
            </IconButton>
          </Link>
        </Tooltip>
        <Tooltip title="Disconnect">
          <IconButton sx={{ color: "white" }} onClick={handleDisconnect}>
            <PowerSettingsNew />
          </IconButton>
        </Tooltip>
      </div>

      <H5>Recent transactions</H5>
      <RecentTransaction />
    </div>
  );
};
