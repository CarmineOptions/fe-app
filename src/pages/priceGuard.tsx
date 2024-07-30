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
        <title>PriceGuard | Carmine Options AMM</title>
        <meta
          name="description"
          content="Insure the value of your crypto assets"
        />
      </Helmet>
      <CrmBanner />
      <h3>PriceGuard</h3>
      <BuyPriceGuardBox />
      <div className={styles.container}>
        <div>
          <h3>Active PriceGuard</h3>
          <ActivePriceGuard />
        </div>
        <div>
          <h3>Claimable PriceGuard</h3>
          <ClaimPriceGuard />
        </div>
      </div>
    </Layout>
  );
};

export default PriceGuard;
