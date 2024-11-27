import { Helmet } from "react-helmet";
import { AlternativeTradingView } from "../components/CryptoGraph/AlternativeTradingView";
import { Layout } from "../components/Layout";

import { TradeTable } from "../components/TradeTable";
import { Divider, H4 } from "../components/common";

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
      <Divider className="my-12" />
      <H4 className="mb-7">Chart</H4>
      <div className="flex justify-evenly gap-10">
        <div className="w-full min-w-[45%] h-[500px]">
          <AlternativeTradingView />
        </div>
      </div>
    </Layout>
  );
};

export default TradePage;
