import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { PoolTable } from "../components/Yield";

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
      <h1>Liquidity Pools</h1>
      <PoolTable />
    </Layout>
  );
};

export default YieldPage;
