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
      <p>
        Choose how much of your STRK holdings you'd like to protect, set your
        safety threshold, and select a duration for your coverage.
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
      <p>
        Note: This feature is designed to help manage the risk of STRK price
        volatility by allowing you to set a protective value. It offers a way to
        safeguard your holdings from significant declines but does not eliminate
        all risks or guarantee against losses. This is not an insurance product,
        but a tool for managing potential downside exposure.
      </p>
    </Layout>
  );
};

export default PriceGuard;
