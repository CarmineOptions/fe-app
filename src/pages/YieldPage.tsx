import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { PoolTable } from "../components/Yield";
import { Divider, H4 } from "../components/common";
import { StarknetDefispring } from "../components/Airdrop/Airdrop";

const YieldPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Yield | Carmine Options AMM</title>
        <meta
          name="description"
          content="Provide liquidity to liquidity pools and earn share of the fees"
        />
      </Helmet>
      <H4>Liquidity Pools</H4>
      <PoolTable />
      <Divider className="my-12" />
      <StarknetDefispring />
    </Layout>
  );
};

export default YieldPage;
