import { RpcProvider } from "starknet";
import { SupportedWalletIds, UserBalance } from "./wallet";
import { constants } from "starknet";

export enum NetworkName {
  Testnet = "Testnet",
  Devnet = "Devnet",
  Mainnet = "Mainnet",
  Testdev = "Testdev",
}

export interface Network {
  name: NetworkName;
  chainId: constants.StarknetChainId;
}

export interface NetworkState {
  walletId?: SupportedWalletIds;
  provider: RpcProvider;
  network: Network;
}

export interface WalletState {
  address?: string,
  balance?: UserBalance
}

export type TxTracking = (s: TransactionState) => void;