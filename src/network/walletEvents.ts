import {
  NetworkChangeEventHandler,
  StarknetWindowObject,
} from "get-starknet-core";
import { store } from "../redux/store";
import { NetworkName } from "../types/network";
import { openNetworkMismatchDialog } from "../redux/actions";
import { updateWalletState } from "../redux/reducers/wallet";

export const walletNetworkChangeHandlerFactory = (wallet: StarknetWindowObject): NetworkChangeEventHandler => (e) => {
  const { network, settings } = store.getState();
  const { id } = wallet;

  if (network.walletId !== id) {
    // not currently connected wallet
    return;
  }

  // "SN_MAIN" is used by ArgentX, "mainnet-alpha" is used by Braavos
  const isWalletMainnet = e === "SN_MAIN" || e === "mainnet-alpha";
  const isAppMainnet = settings.network === NetworkName.Mainnet;

  if (isWalletMainnet || isAppMainnet) {
    // all is well, do nothing
    return;
  }

  if (settings.network === NetworkName.Devnet || settings.network === NetworkName.Testnet) {
    // devnet can do whatever it wants, do nothing
    return;
  }

  // network mismatch - open the dialog
  openNetworkMismatchDialog();
};

  export const walletAccountChangeHandlerFactory = (wallet: StarknetWindowObject) => (e: any) => {
    const { network } = store.getState();
    const { id } = wallet;
  
    if (network.walletId !== id) {
      return;
    }

    if (Array.isArray(e)) {
      store.dispatch(updateWalletState({ address: e[0] }));
    } else {
      store.dispatch(updateWalletState({ address: e }));
    }
  };

type EventList = {
  event: string;
  walletId: string;
};

const eventList: EventList[] = [];

export const addWalletEventHandlers = (wallet: StarknetWindowObject) => {
  if (
    eventList.some(
      (eventObj) =>
        eventObj.event === "networkChanged" && eventObj.walletId === wallet.id
    )
  ) {
    // this event listener is already added - do nothing
    return;
  }

  const handler = walletNetworkChangeHandlerFactory(wallet);
  wallet.on("networkChanged", handler);
  eventList.push({
    event: "networkChanged",
    walletId: wallet.id,
  });

  const accountHandler = walletAccountChangeHandlerFactory(wallet);
  wallet.on("accountsChanged", accountHandler);
  eventList.push({
    event: "accountsChanged",
    walletId: wallet.id,
  });
};
