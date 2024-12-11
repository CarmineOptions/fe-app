import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";

import { TradeTable } from "../components/TradeTable";

const TradePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Trade | Carmine Options AMM</title>
        <meta
          name="description"
          content="Buy and sell crypto options with Carmine Options AMM"
        />
      </Helmet>
      <TradeTable />
    </Layout>
  );
};

export default TradePage;
