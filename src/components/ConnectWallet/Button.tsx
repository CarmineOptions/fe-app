import { useAccount } from "@starknet-react/core";
import { AccountInfo } from "./AccountInfo";
import { onConnect } from "../../network/hooks";
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { Button } from "../common/Button";
import WalletIcon from "./Wallet.svg?react";
import { P4 } from "../common";

export const WalletButton = () => {
  const { account, address } = useAccount();
  const { openWalletConnectModal } = useConnectWallet();

  if (account && address) {
    onConnect(account, address);

    // wallet connected
    return <AccountInfo />;
  }

  return (
    <Button className="py-2" type="primary" onClick={openWalletConnectModal}>
      Connect Wallet
    </Button>
  );
};

type WalletButton = {
  msg: string;
};

export const SecondaryConnectWallet = ({ msg }: WalletButton) => {
  const { openWalletConnectModal } = useConnectWallet();

  return (
    <button
      className="w-fit p-2 text-base rounded-[2px] bg-ui-neutralBg text-ui-neutralAccent"
      onClick={openWalletConnectModal}
    >
      <div className="flex items-center gap-2">
        <WalletIcon width="14px" height="14px" />
        <P4 className="text-[12px]">{msg}</P4>
      </div>
    </button>
  );
};
