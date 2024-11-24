import { useAccount } from "@starknet-react/core";
import { AccountInfo } from "./AccountInfo";
import { onConnect } from "../../network/hooks";
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { Button } from "../common/Button";

export const WalletButton = () => {
  const { account, address } = useAccount();
  const { openWalletConnectModal } = useConnectWallet();

  if (account && address) {
    onConnect(account, address);

    // wallet connected
    return <AccountInfo />;
  }

  return (
    <Button
      className="py-[8px]"
      type="primary"
      onClick={openWalletConnectModal}
    >
      Connect Wallet
    </Button>
  );
};
