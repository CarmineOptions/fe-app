import { mainnet } from "@starknet-react/chains";
import { argent, braavos, publicProvider, StarknetConfig, starkscan, useInjectedConnectors } from "@starknet-react/core";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const StarknetProvider = ({ children }: Props) => {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [argent(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "alphabetical",
  });

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  );
};
