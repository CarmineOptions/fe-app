import { ProviderOptions } from "starknet";
import { StarknetChainId } from "starknet/constants";
import { Settings } from "../types/environment";
import { ThemeVariants } from "../style/themes";

export const devProviderOptions: ProviderOptions = {
  sequencer: {
    baseUrl: process.env.REACT_APP_GATEWAY!,
    feederGatewayUrl: "feeder_gateway",
    gatewayUrl: process.env.REACT_APP_GATEWAY,
    chainId: process.env.REACT_APP_CHAIN_ID as StarknetChainId,
  },
};

export const defaultSettings: Settings = {
  autoconnect: true,
  theme: ThemeVariants.dark,
};
