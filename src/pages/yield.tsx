import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { PoolList } from "../components/StakeCapital";

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
      <PoolList />
    </Layout>
  );
};

export default YieldPage;
