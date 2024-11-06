import { useAccount } from "@starknet-react/core";
import { AccountInfo } from "./AccountInfo";
import { onConnect } from "../../network/hooks";
import { useConnectWallet } from "../../hooks/useConnectWallet";

import styles from "./button.module.css";

export const WalletButton = () => {
  const { account, address } = useAccount();
  const { openWalletConnectModal } = useConnectWallet();

  if (account && address) {
    onConnect(account, address);

    // wallet connected
    return <AccountInfo />;
  }

  return (
    <button
      className={`primary active ${styles.custom}`}
      onClick={openWalletConnectModal}
    >
      Connect Wallet
    </button>
  );
};
