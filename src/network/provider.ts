import { Provider, ProviderOptions } from "starknet";
import { Network, NetworkName } from "../types/network";
import { constants } from "starknet";

const devnetOptions = {
  sequencer: {
    baseUrl: process.env.REACT_APP_GATEWAY!,
    feederGatewayUrl: "feeder_gateway",
    gatewayUrl: process.env.REACT_APP_GATEWAY,
    chainId: process.env.REACT_APP_CHAIN_ID as constants.StarknetChainId,
  },
};

const testnetOptions: ProviderOptions = {
  sequencer: {
    network: "goerli-alpha",
  },
};

export const networkProviderOptionsMap = new Map<NetworkName, ProviderOptions>([
  [NetworkName.Devnet, devnetOptions],
  [NetworkName.Testnet, testnetOptions],
  [NetworkName.Testdev, testnetOptions],
  [NetworkName.Mainnet, testnetOptions], // TODO: add mainnet
]);

export const getProviderByNetwork = (network: NetworkName): Provider =>
  new Provider(networkProviderOptionsMap.get(network) as ProviderOptions); // Map must be exhaustive!

export const getNetworkObjectByNetworkName = (name: NetworkName): Network => {
  // Testnet, Testdev and Devnet use Testnet chainId
  const chainId =
    name === NetworkName.Mainnet
      ? constants.StarknetChainId.MAINNET
      : constants.StarknetChainId.TESTNET;

  return {
    name,
    chainId,
  };
};