import { CSSProperties } from "react";
import { useAccount } from "@starknet-react/core";
import { WalletIcon } from "../assets";
import { openAccountDialog } from "../../redux/actions";
import { addressElision } from "../../utils/utils";
import { SupportedWalletIds } from "../../types/wallet";
import { useDomain } from "../../hooks/useDomain";
import { Button } from "../common/Button";

const truncateUsername = (username: string, maxLength = 15) => {
  if (username.length > maxLength) {
    return username.substring(0, maxLength) + "...";
  }
  return username;
};

export const AccountInfo = () => {
  const { connector, address } = useAccount();
  const { username } = useDomain(address);

  if (connector === undefined || address === undefined) {
    return null;
  }

  const handleClick = () => {
    openAccountDialog();
  };

  const sx: CSSProperties = {};

  if (connector.id === SupportedWalletIds.Braavos) {
    sx.background = "#222a39";
  }

  return (
    <Button className="h-8" type="primary" onClick={handleClick}>
      <div className="flex items-center gap-3 normal-case">
        {connector.id === SupportedWalletIds.Braavos ? (
          <div className="w-4 h-4 rounded-full bg-[url('/BraavosLogo.png')] bg-contain" />
        ) : (
          <WalletIcon wallet={connector} sx={sx} />
        )}
        {!username ? (
          <span>{addressElision(address)}</span>
        ) : (
          <span>{truncateUsername(username)}</span>
        )}
      </div>
    </Button>
  );
};
