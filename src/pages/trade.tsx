import { Helmet } from "react-helmet";
import { AlternativeTradingView } from "../components/CryptoGraph/AlternativeTradingView";
import { Layout } from "../components/Layout";

import style from "./trade.module.css";
import { TradeTable } from "../components/TradeTable";
import { Divider } from "../components/common";

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
      <h2 className="botmargin">Chart</h2>
      <div className={style.graphwidgetwrapper}>
        <div className={style.graphcontainer}>
          <AlternativeTradingView />
        </div>
      </div>
    </Layout>
  );
};

export default TradePage;
