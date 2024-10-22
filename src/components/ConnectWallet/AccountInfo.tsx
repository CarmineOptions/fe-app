import { WalletIcon } from "../assets";
import { openAccountDialog } from "../../redux/actions";
import { addressElision } from "../../utils/utils";

import { SupportedWalletIds } from "../../types/wallet";
import { CSSProperties } from "react";
import { useAccount } from "@starknet-react/core";
import { useDomain } from "../../hooks/useDomain";

import styles from "./button.module.css";

const truncateUsername = (username: string, maxLength = 15) => {
  if (username.length > maxLength) {
    return username.substring(0, maxLength) + "...";
  }
  return username;
};

export const AccountInfo = () => {
  const { connector, address } = useAccount();
  const { username } = useDomain();

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
    <button className={`primary active ${styles.custom}`} onClick={handleClick}>
      <div className={styles.walletinfo}>
        <WalletIcon wallet={connector} sx={sx} />
        {username === undefined ? (
          <span>{addressElision(address)}</span>
        ) : (
          <span>{truncateUsername(username)}</span>
        )}
      </div>
    </button>
  );
};
