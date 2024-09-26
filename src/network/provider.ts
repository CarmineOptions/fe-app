import { RpcProvider, RpcProviderOptions, constants } from "starknet";
import { Network, NetworkName } from "../types/network";
import { NETWORK } from "../constants/amm";
import { apiUrl } from "../api";

// TODO: should be constants.StarknetChainId.SN_SEPOLIA - upgrade starknetjs
const SN_SEPOLIA_CHAINID =
  "0x534e5f5345504f4c4941" as constants.StarknetChainId;

export const testnetOptions: RpcProviderOptions = {
  nodeUrl: apiUrl("call", { network: "testnet" }),
  chainId: SN_SEPOLIA_CHAINID,
};

export const mainnetOptions: RpcProviderOptions = {
  // nodeUrl: apiUrl("call", { network: "mainnet" }),
  nodeUrl: "http://178.32.172.155:5050", // dev mainnet
  chainId: constants.StarknetChainId.SN_MAIN,
};

export const providerOptions = (): RpcProviderOptions => {
  if (NETWORK === "mainnet") {
    return mainnetOptions;
  } else if (NETWORK === "testnet") {
    return testnetOptions;
    // } else if (NETWORK === "devnet") {
    //   return devnetOptions;
  } else {
    throw new Error(`Invalid network provided! ${NETWORK}`);
  }
};

export const provider = new RpcProvider(providerOptions());

export const getNetworkObject = (): Network => {
  if (NETWORK === "mainnet") {
    return {
      name: NetworkName.Mainnet,
      chainId: constants.StarknetChainId.SN_MAIN,
    };
  } else if (NETWORK === "testnet") {
    return {
      name: NetworkName.Testnet,
      chainId: SN_SEPOLIA_CHAINID,
    };
  } else if (NETWORK === "devnet") {
    return {
      name: NetworkName.Testnet,
      chainId: SN_SEPOLIA_CHAINID,
    };
  } else {
    throw new Error(`Invalid network provided! ${NETWORK}`);
  }
};

export const networkObject = getNetworkObject();
