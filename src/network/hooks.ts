import { userLpBalance } from "../components/Transfer/transfer";
import { API_URL, isMainnet } from "../constants/amm";
import {
  addReferredPair,
  openTransferModal,
  transferDialogShown,
} from "../redux/actions";
import { store } from "../redux/store";
import { debug } from "../utils/debugger";
import { AccountInterface } from "starknet";

const reportReferral = (referredAddress: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("ref_code");

  if (!code) {
    return;
  }

  const referredPairs = store.getState().ui.referralsSent;

  if (
    // already sent
    referredPairs.some(
      (pair) => pair.address === referredAddress && pair.code === code
    )
  ) {
    return;
  }

  debug({ message: "found referral code", code, referredAddress });

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      referred_wallet_address: referredAddress,
      referral_code: code,
    }),
  };

  fetch(`${API_URL}referral_event`, options)
    .then((response) => {
      if (response.ok) {
        addReferredPair({ code, address: referredAddress });
      }
    })
    .catch((err) => console.error(err));
};

const transferLps = (address: string) => {
  const dialogShown = store.getState().ui.transferDialogShown;

  if (!dialogShown && isMainnet) {
    transferDialogShown();
    userLpBalance(address).then((transferData) => {
      if (transferData.shouldTransfer) {
        openTransferModal(transferData);
      }
    });
  }
};

/**
 * Gets executed when a wallet is connected
 */
export const onConnect = (account: AccountInterface) => {
  if (isMainnet) {
    // report user came with referral
    reportReferral(account.address);

    // prompt user to transfer capital from old AMM
    // TODO: reactivate when AMM fixed
    // transferLps(account.address);
  }
};
