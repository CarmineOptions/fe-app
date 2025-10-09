import ReactDOM from "react-dom";
import { BraavosBanner } from "../components/Banner/BraavosBanner";
import { Connector, useConnect } from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";
import { connect } from "starknetkit";
import { isMainnet } from "../constants/amm";
import { constants } from "starknet";
import { debug } from "../utils/debugger";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { BraavosMobileConnector } from "starknetkit/braavosMobile";
import { Xverse } from "starknetkit/xverse";
import { Braavos } from "starknetkit/braavos";
import { ArgentX } from "starknetkit/argentX";
import { Keplr } from "starknetkit/keplr";

const mobileConnectors = [
  BraavosMobileConnector.init(),
  ArgentMobileConnector.init({
    options: {
      url: typeof window !== "undefined" ? window.location.href : "",
      dappName: "RemusDEX",
    },
  }),
];

const connectors = [
  new Braavos(),
  new ArgentX(),
  new Keplr(),
  new InjectedConnector({ options: { id: "okxwallet", name: "OKX" } }),
  new Xverse(),
];

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

  ReactDOM.render(BraavosBanner(), banner);

  braavosWalletElem?.insertAdjacentElement("afterend", banner);
};

export const useConnectWallet = () => {
  const { connectAsync } = useConnect();

  const openWalletConnectModal = () => {
    connect({
      modalMode: "alwaysAsk",
      dappName: "Carmine Options AMM",
      modalTheme: "dark",
      connectors: window.outerWidth < 700 ? mobileConnectors : connectors,
      argentMobileOptions: {
        dappName: "Carmine Options AMM",
        projectId: "7f4efbc06ed01f0edd1d0558369e885a",
        chainId: isMainnet
          ? constants.NetworkName.SN_MAIN
          : constants.NetworkName.SN_SEPOLIA,
        url: window.location.hostname,
        icons: ["https://app.carmine.finance/android-chrome-512x512.png"],
      },
    })
      .then((modalResult) => {
        const { connector } = modalResult;
        if (connector) {
          connectAsync({ connector: connector as Connector });
        }
      })
      .catch((error: unknown) => {
        debug("Failed connecting wallet", error);
      });

    if (isMainnet) {
      // call inside timeout to make sure modal is present in the DOM
      setTimeout(() => {
        addBanner();
      }, 1);
    }
  };

  return { openWalletConnectModal };
};
