import { TokenKey } from "../classes/Token";

export enum SupportedWalletIds {
  ArgentX = "argentX",
  Braavos = "braavos",
  OKXWallet = "okxwallet",
  Bitget = "bitkeep",
  Keplr = "keplr",
}

export type UserBalance = {
  [key in TokenKey]: bigint;
};

declare global {
  interface Window {
    ethereum?: unknown;
  }
}
