/* eslint-disable @typescript-eslint/no-unused-vars */
import { connect, Connector, StarknetkitConnector } from "starknetkit";
import { AccountInfo } from "./AccountInfo";
import { SupportedWalletIds } from "../../types/wallet";
import { onConnect } from "../../network/hooks";
import ReactDOM from "react-dom";
import { BraavosBanner } from "./BraavosBanner";
import { debug } from "../../utils/debugger";
import { ConnectVariables, useAccount, useConnect } from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";
import { isMainnet } from "../../constants/amm";

import styles from "./button.module.css";
import {
  ArgentMobileConnector,
  isInArgentMobileAppBrowser,
} from "starknetkit/argentMobile";
import { constants } from "starknet";

type CustomWallet = {
  id: SupportedWalletIds;
  name: string;
  alt?: string;
  image: string;
  windowPropName: keyof typeof window;
  link: string;
};

const okxWallet: CustomWallet = {
  id: SupportedWalletIds.OKXWallet,
  name: "OKX Wallet",
  alt: "OKX Wallet",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
  windowPropName: "starknet_okxwallet",
  link: "https://www.okx.com/web3",
};

const bitgetWallet: CustomWallet = {
  id: SupportedWalletIds.Bitget,
  name: "Bitget Wallet",
  alt: "Bitget Wallet",
  image:
    "data:image/png;base64,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",
  windowPropName: "starknet_bitkeep",
  link: "https://web3.bitget.com/en/",
};

const keplrWallet: CustomWallet = {
  id: SupportedWalletIds.Keplr,
  name: "Keplr",
  alt: "Keplr",
  image:
    "data:image/png;base64,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",
  windowPropName: "starknet_keplr",
  link: "https://www.keplr.app/",
};

const customWalletIdMap: {
  [key: string]: CustomWallet;
} = {
  [SupportedWalletIds.OKXWallet]: okxWallet,
  [SupportedWalletIds.Bitget]: bitgetWallet,
  [SupportedWalletIds.Keplr]: keplrWallet,
};

const addBanner = () => {
  const shadowParent = document.getElementById("starknetkit-modal-container");
  if (!shadowParent) {
    return;
  }

  const list = shadowParent.shadowRoot!.querySelector("ul");
  const overlay = shadowParent.shadowRoot!.querySelector("div");

  if (!list || !overlay) {
    return;
  }

  const walletElems = Array.from(list.childNodes) as HTMLElement[];

  const braavosWalletElem = walletElems.find((c) => {
    if (c && c.querySelector) {
      const p = c.querySelector("p");
      if (
        p &&
        (p.innerText === "Braavos" || p.innerText === "Install Braavos")
      ) {
        return true;
      }
    }
    return false;
  });

  const banner = document.createElement("div");
  banner.style.width = "100%";
  banner.style.background =
    "linear-gradient(94deg, #1A4079 -1.25%, #0F1242 101.88%)";
  banner.style.borderRadius = "6px";

  ReactDOM.render(<BraavosBanner />, banner);

  braavosWalletElem?.insertAdjacentElement("afterend", banner);
};

// this is a hack that adds one extra wallet
// to "starknetkit" modal with custom callback
const addCustomWallet = (wallet: CustomWallet) => {
  const shadowParent = document.getElementById("starknetkit-modal-container");

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

  if (!paragraphs || !paragraphs[0] || !img) {
    return;
  }

  Array.from(paragraphs).map((p) => (p.innerText = ""));
  paragraphs[0].innerText = "Get " + wallet.name;
  img.alt = wallet.alt || "";
  img.src = wallet.image;

  // append custom wallet to the bottom of the list
  list.appendChild(customWallet);

  customWallet.addEventListener("click", () => {
    window.open(wallet.link);
    overlay.click();
  });
};

export const openWalletConnectDialog = async (
  connectAsync: (args?: ConnectVariables) => Promise<void>
) => {
  const customConnectorIds = [
    SupportedWalletIds.OKXWallet,
    SupportedWalletIds.Bitget,
    SupportedWalletIds.Keplr,
  ];
  const { injectedCustomConnectors, missingCustomConnectors } =
    customConnectorIds.reduce(
      (acc, id) => {
        const windowPropertyName = `starknet_${id}`;
        window[windowPropertyName] === undefined
          ? acc.missingCustomConnectors.push(id)
          : acc.injectedCustomConnectors.push(id);
        return acc;
      },
      {
        injectedCustomConnectors: [] as SupportedWalletIds[],
        missingCustomConnectors: [] as SupportedWalletIds[],
      }
    );

  const injectedToBeShown = [
    SupportedWalletIds.ArgentX,
    SupportedWalletIds.Braavos,
    ...injectedCustomConnectors,
  ].map((id) => new InjectedConnector({ options: { id } }));

  connect({
    modalMode: "alwaysAsk",
    dappName: "Carmine Options AMM",
    modalTheme: "dark",
    connectors: isInArgentMobileAppBrowser()
      ? [
          ArgentMobileConnector.init({
            options: {
              dappName: "Carmine Options AMM",
              projectId: "7f4efbc06ed01f0edd1d0558369e885a",
              chainId: constants.NetworkName.SN_MAIN,
              url: window.location.hostname,
              icons: ["https://app.carmine.finance/android-chrome-512x512.png"],
              rpcUrl: "https://api.carmine.finance/api/v1/mainnet/call",
            },
          }) as StarknetkitConnector,
          ...injectedToBeShown,
        ]
      : [...injectedToBeShown],
  })
    .then((modalResult) => {
      const { connector } = modalResult;
      if (connector) {
        connectAsync({ connector });
      }
    })
    .catch((error: any) => {
      debug("Failed connecting wallet", error);
    });

  if (isMainnet) {
    // call inside timeout to make sure modal is present in the DOM
    setTimeout(() => {
      missingCustomConnectors.forEach((id) => {
        const wallet = customWalletIdMap[id];
        if (!wallet) {
          return;
        }
        addCustomWallet(wallet);
      });
      addBanner();
    }, 1);
  }
};

export const WalletButton = () => {
  const { account, address } = useAccount();
  const { connectAsync } = useConnect();

  if (account && address) {
    onConnect(account, address);

    // wallet connected
    return <AccountInfo />;
  }

  return (
    <button
      className={`primary active ${styles.custom}`}
      onClick={() => openWalletConnectDialog(connectAsync)}
    >
      Connect Wallet
    </button>
  );
};
