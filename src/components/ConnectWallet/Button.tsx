import { connect } from "starknetkit";

import { useAccount } from "../../hooks/useAccount";
import { connect as accountConnect } from "../../network/account";
import { AccountInfo } from "./AccountInfo";
import styles from "../../style/button.module.css";
import { isMainnet } from "../../constants/amm";
import { SupportedWalletIds } from "../../types/wallet";
import { userLpBalance } from "../Transfer/transfer";
import { openTransferModal, transferDialogShown } from "../../redux/actions";
import { store } from "../../redux/store";

type CustomWallet = {
  id: SupportedWalletIds;
  name: string;
  alt?: string;
  image: string;
  windowPropName: keyof typeof window;
};

const okxWallet: CustomWallet = {
  id: SupportedWalletIds.OKXWallet,
  name: "OKX Wallet",
  alt: "OKX Wallet",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
  windowPropName: "starknet_okxwallet",
};

// this is a hack that adds one extra wallet
// to "starknetkit" modal with custom callback
const addCustomWallet = (wallet: CustomWallet) => {
  // starknet wallet object or undefined
  const walletWindowObject = window[wallet.windowPropName];

  const shadowParent = Array.from(document.body.children)
    .filter((el) => el.tagName === "DIV")
    .find((e) => e.shadowRoot && e.shadowRoot?.children?.length === 2);

  if (!shadowParent) {
    return;
  }

  const list = shadowParent.shadowRoot!.querySelector("ul");
  const overlay = shadowParent.shadowRoot!.querySelector("div");

  if (!list || !overlay) {
    return;
  }

  // create a copy of the first wallet on the list
  const customWallet = list.children[0].cloneNode(true);
  const paragraphs = (customWallet as HTMLElement).getElementsByTagName("p");
  const img =
    ((customWallet as HTMLElement).querySelector("img") as HTMLImageElement) ||
    undefined;

  if (!paragraphs || !paragraphs[0] || !paragraphs[1] || !img) {
    return;
  }

  paragraphs[0].innerText = wallet.name;
  paragraphs[1].innerText = "";
  img.alt = wallet.alt || "";
  img.src = wallet.image;

  // append custom wallet to the bottom of the list
  list.appendChild(customWallet);

  customWallet.addEventListener("click", () => {
    // user does not have wallet, open extension store
    if (!walletWindowObject) {
      if (wallet.id === SupportedWalletIds.OKXWallet) {
        window.open(
          "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge"
        );
      }

      return;
    }
    accountConnect(walletWindowObject);
    // simulate overlay click to close the modal
    overlay.click();
  });
};

export const WalletButton = () => {
  const account = useAccount();
  const dialogShown = store.getState().ui.transferDialogShown;

  const handleConnect = async () => {
    connect({
      modalMode: "alwaysAsk",
      dappName: "Carmine Options AMM",
      // app currently has only dark theme
      modalTheme: "dark",
    }).then((wallet) => {
      if (wallet && wallet.isConnected) {
        accountConnect(wallet);
      }
    });

    // OKX Wallet currently supports only Mainnet
    if (isMainnet) {
      // call inside timeout to make sure modal is present in the DOM
      setTimeout(() => addCustomWallet(okxWallet), 1);
    }
  };

  if (account) {
    if (!dialogShown && isMainnet) {
      transferDialogShown();
      userLpBalance(account.address).then((transferData) => {
        if (transferData.shouldTransfer) {
          openTransferModal(transferData);
        }
      });
    }
    // wallet connected
    return <AccountInfo />;
  }

  return (
    <button className={styles.secondary} onClick={handleConnect}>
      Connect
    </button>
  );
};
