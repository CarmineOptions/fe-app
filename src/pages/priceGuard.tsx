import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { CrmBanner } from "../components/Banner";
import { UserPriceGuard, PriceGuard } from "../components/PriceGuard";

const PriceGuardPage = () => {
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
      <PriceGuard />
      <UserPriceGuard />
    </Layout>
  );
};

export default PriceGuardPage;
