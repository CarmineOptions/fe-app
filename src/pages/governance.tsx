import { Box, Typography } from "@mui/material";
import { useEffect } from "react";

import { NetworkButton } from "../components/ConnectWallet/NetworkButton";
import { Layout } from "../components/layout";
import { Proposals } from "../components/Proposal";
import { useNetwork } from "../hooks/useNetwork";
import { NetworkName } from "../types/network";

type Props = {
  message: string;
  data?: string[];
};

const Governance = () => {
  const network = useNetwork();
  const isMainnet = network === NetworkName.Mainnet;
  const SwitchNetwork = ({ message, data }: Props) => (
    <Box
      sx={{
        marginTop: 4,
        padding: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ mb: 4 }}>{message}</Typography>
        <NetworkButton />
        {/* {account && <ClaimButton account={account} data={data} />} */}
      </Box>
    </Box>
  );
  useEffect(() => {
    document.title = "Governance | Carmine Finance";
  });

  return (
    <Layout>
      {!isMainnet && (
        <SwitchNetwork message="To see live proposals please switch to mainnet" />
      )}
      {isMainnet && <Proposals />}
    </Layout>
  );
};

export default Governance;
