import { WalletIcon } from "../assets";
import { useWallet } from "../../hooks/useWallet";
import { openAccountDialog } from "../../redux/actions";
import { addressElision } from "../../utils/utils";
import styles from "../../style/button.module.css";

export const AccountInfo = () => {
  const wallet = useWallet();

  if (!wallet) {
    return null;
  }

  const iconStyle = {
    width: 30,
    marginRight: 1,
  };

  const handleClick = () => {
    openAccountDialog();
  };

  const { account } = wallet;
  const { address } = account;

  return (
    <button className={styles.secondary} onClick={handleClick}>
      <>
        <WalletIcon sx={iconStyle} wallet={wallet} />
        {addressElision(address)}
      </>
    </button>
  );
};
