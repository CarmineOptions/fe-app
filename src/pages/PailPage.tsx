import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { Pail } from "../components/PAIL";
import { H4, P3 } from "../components/common";
import { Owned } from "../components/PAIL/Owned";
import { useAccount } from "@starknet-react/core";
import { useUserBalance } from "../hooks/useUserBalance";
import { CRM_ADDRESS, VE_CRM_ADDRESS } from "../constants/amm";
import { SecondaryConnectWallet } from "../components/ConnectWallet/Button";
import { LoadingAnimation } from "../components/Loading/Loading";

const NoWallet = () => {
  return (
    <div className="flex flex-col gap-3">
      <P3>
        Protection Against Impermanent Loss is currently only for CRM token
        holders.
      </P3>
      <SecondaryConnectWallet msg="Connect wallet and check eligibility" />
    </div>
  );
};

const NoCrmTokens = () => {
  return (
    <div className="flex flex-col gap-3">
      <P3>
        Protection Against Impermanent Loss is currently only for CRM token
        holders.
      </P3>
      <P3>Connected wallet does not hold any CRM or veCRM tokens.</P3>
    </div>
  );
};

const PailPage = () => {
  const { address } = useAccount();
  const { data: crmBalance } = useUserBalance(CRM_ADDRESS);
  const { data: veCrmBalance } = useUserBalance(VE_CRM_ADDRESS);

  const loading = crmBalance === undefined || veCrmBalance === undefined;
  const notEligible = crmBalance === 0n && veCrmBalance === 0n;
  const eligible = !notEligible;

  return (
    <Layout>
      <Helmet>
        <title>PAIL | Carmine Options AMM</title>
        <meta
          name="description"
          content="Protection Against Impermanent Loss"
        />
      </Helmet>
      <div className="flex flex-col gap-10">
        <H4>Protection Against Impermanent Loss</H4>
        {!address ? (
          <NoWallet />
        ) : loading ? (
          <LoadingAnimation />
        ) : notEligible ? (
          <NoCrmTokens />
        ) : null}

        {!loading && !!eligible && <Pail />}
        {!loading && !!eligible && <Owned />}
      </div>
    </Layout>
  );
};

export default PailPage;
