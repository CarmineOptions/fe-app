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
        <title>Price Protect | Carmine Options AMM</title>
        <meta
          name="description"
          content="Protect the price of your crypto assets"
        />
      </Helmet>
      <CrmBanner />
      <h3>Price Protect</h3>
      <p>
        Safeguard your holdings from major price movement.{" "}
        <a
          rel="noopener nofollow noreferrer"
          target="_blank"
          href="https://docs.carmine.finance/carmine-options-amm/use-cases"
        >
          Learn more
        </a>
      </p>
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
