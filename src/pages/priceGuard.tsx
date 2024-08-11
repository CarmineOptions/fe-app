import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { BuyPriceGuardBox } from "../components/PriceGuard/BuyPriceGuardBox";
import { ActivePriceGuard } from "../components/PriceGuard/ActivePriceGuard";
import { ClaimPriceGuard } from "../components/PriceGuard/ClaimPriceGuard";
import styles from "./priceGuard.module.css";
import { CrmBanner } from "../components/Banner";

const PriceGuard = () => {
  return (
    <Layout>
      <Helmet>
        <title>Price Guard | Carmine Options AMM</title>
        <meta
          name="description"
          content="Guard the price of your crypto assets"
        />
      </Helmet>
      <CrmBanner />
      <h3>Price Guard</h3>
      <BuyPriceGuardBox />
      <div className={styles.container}>
        <div>
          <h3>Active Price Guard</h3>
          <ActivePriceGuard />
        </div>
        <div>
          <h3>Claimable Price Guard</h3>
          <ClaimPriceGuard />
        </div>
      </div>
    </Layout>
  );
};

export default PriceGuard;
