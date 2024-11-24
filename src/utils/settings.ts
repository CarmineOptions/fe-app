import { NetworkName } from "../types/network";
import { Settings } from "../types/settings";
import { debug } from "./debugger";

const SETTINGS_KEY = "app-settings";

const DEFAULT_SETTINGS: Settings = {
  autoconnect: true,
  network: NetworkName.Mainnet,
  slippage: 5,
};

export const validateSettings = (v: unknown): v is Settings => {
  if (
    !v ||
    !Object.hasOwn(v, "autoconnect") ||
    !Object.hasOwn(v, "theme") ||
    !Object.hasOwn(v, "network") ||
    !Object.hasOwn(v, "slippage")
  ) {
    return false;
  }

  if (
    !Object.values(NetworkName).includes((v as Settings).network) ||
    typeof (v as Settings).slippage !== "number"
  ) {
    return false;
  }

  return true;
};

export const storeSetting = (s: Settings) => {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch (error) {
    debug("Failed to store setting to local storage");
    console.error(error);
  }
};

export const retrieveSettings = (): Settings => {
  const s = window.localStorage.getItem(SETTINGS_KEY);
  if (!s) {
    return DEFAULT_SETTINGS;
  }
  try {
    const v: unknown = JSON.parse(s);
    if (validateSettings(v)) {
      return v;
    }
    return DEFAULT_SETTINGS;
  } catch (e: any) {
    debug("Failed to retrieve settings", e?.message);
    return DEFAULT_SETTINGS;
  }
};
