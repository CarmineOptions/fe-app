import { WalletIcon } from "../assets";
import { useWallet } from "../../hooks/useWallet";
import { openAccountDialog } from "../../redux/actions";
import { addressElision } from "../../utils/utils";

import styles from "./button.module.css";

export const AccountInfo = () => {
  const wallet = useWallet();

  if (!wallet) {
    return null;
  }

  const iconStyle = {
    width: 20,
    marginRight: 1,
    background: "black",
  };

  const handleClick = () => {
    openAccountDialog();
  };

  const { account } = wallet;
  const { address } = account;

  return (
    <button className={`primary active ${styles.custom}`} onClick={handleClick}>
      <div className={styles.walletinfo}>
        <WalletIcon sx={iconStyle} wallet={wallet} />
        <span>{addressElision(address)}</span>
      </div>
    </button>
  );
};
