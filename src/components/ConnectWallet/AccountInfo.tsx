import { WalletIcon } from "../assets";
import { useWallet } from "../../hooks/useWallet";
import { openAccountDialog } from "../../redux/actions";
import styles from "../../style/button.module.css";
import { useSelector } from "react-redux";
import { useAccount } from "../../hooks/useAccount";
import { getUserBalance } from "../../calls/balanceOf";
import { useEffect } from "react";
import { store } from "../../redux/store";
import { updateWalletState } from "../../redux/reducers/wallet";

export const AccountInfo = () => {
  const wallet = useWallet();
  const account = useAccount();
  const address = useSelector((state: any) => state.wallet.address);

  useEffect(() => {
    if (account && account.address) {
      (async () => {
        try {
          const balance = await getUserBalance(account);

          if (balance) {
            store.dispatch(updateWalletState({ balance: balance }));
          }
        } catch (err) {
          console.error('err = ', err);
        }
      })();
    } else {
      store.dispatch(updateWalletState({ balance: undefined }));
    }
  }, [account]);

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

  const formatAddress = (address: any) => {
    if (address) {
      const start = address.substring(0, 5);
      const end = address.substring(address.length - 5);

      return `${start}...${end}`;
    }
  }

  return (
    <button className={styles.secondary} onClick={handleClick}>
      <>
        <WalletIcon sx={iconStyle} wallet={wallet} />
        {formatAddress(address)}
      </>
    </button>
  );
};
