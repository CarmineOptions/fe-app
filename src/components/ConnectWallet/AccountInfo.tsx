import { WalletIcon } from "../assets";
import { useWallet } from "../../hooks/useWallet";
import { openAccountDialog } from "../../redux/actions";
import { addressElision } from "../../utils/utils";

import styles from "./button.module.css";
import { SupportedWalletIds } from "../../types/wallet";
import { CSSProperties } from "react";

export const AccountInfo = () => {
  const wallet = useWallet();

  if (!wallet) {
    return null;
  }

  const handleClick = () => {
    openAccountDialog();
  };

  const { account } = wallet;
  const { address } = account;

  const sx: CSSProperties = {};

  console.log(wallet);

  if (wallet.id === SupportedWalletIds.Braavos) {
    sx.background = "#222a39";
  }

  return (
    <button className={`primary active ${styles.custom}`} onClick={handleClick}>
      <div className={styles.walletinfo}>
        <WalletIcon wallet={wallet} sx={sx} />
        <span>{addressElision(address)}</span>
      </div>
    </button>
  );
};
