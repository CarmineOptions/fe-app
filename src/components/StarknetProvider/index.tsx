import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  argent,
  braavos,
  useInjectedConnectors,
  jsonRpcProvider,
  starkscan,
} from "@starknet-react/core";
import { isMainnet } from "../../constants/amm";
import { apiUrl } from "../../api";

export const StarknetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "random",
  });

  const [chain, nodeUrl] = isMainnet
    ? [mainnet, apiUrl("call", { network: "mainnet" })]
    : [sepolia, apiUrl("call", { network: "testnet" })];

  const rpc = () => ({
    nodeUrl,
  });

  const provider = jsonRpcProvider({ rpc });

  return (
    <StarknetConfig
      chains={[chain]}
      provider={provider}
      connectors={connectors}
      explorer={starkscan}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
};
