import { Helmet } from "react-helmet";
import { useState } from "react";

import { AlternativeTradingView } from "../components/CryptoGraph/AlternativeTradingView";
import { Layout } from "../components/Layout";
import TradeTable from "../components/TradeTable";

import buttonStyles from "../style/button.module.css";
import style from "./trade.module.css";
import { AvnuWidget } from "../components/AvnuWidget";
import { CrmBanner } from "../components/Banner";
import { ProfitAndLoss } from "../components/PnL";

enum Variant {
  Options,
  Swap,
}

const TradePage = () => {
  const [variant, setVariant] = useState(Variant.Options);
  return (
    <Layout>
      <Helmet>
        <title>Trade | Carmine Options AMM</title>
        <meta
          name="description"
          content="Buy and sell crypto options with Carmine Options AMM"
        />
      </Helmet>
      <CrmBanner />
      <div>
        <button
          onClick={() => setVariant(Variant.Options)}
          className={variant === Variant.Options ? buttonStyles.green : ""}
        >
          Options
        </button>
        <button
          onClick={() => setVariant(Variant.Swap)}
          className={variant === Variant.Swap ? buttonStyles.green : ""}
        >
          Swap
        </button>
      </div>
      <div className={style.graphwidgetwrapper}>
        <div className={style.graphcontainer}>
          <AlternativeTradingView />
        </div>
        {variant === Variant.Swap && <AvnuWidget />}
      </div>
      {variant === Variant.Options && <TradeTable />}

      <div style={{ marginTop: "50px" }}>
        <ProfitAndLoss />
      </div>
    </Layout>
  );
};

export default TradePage;
