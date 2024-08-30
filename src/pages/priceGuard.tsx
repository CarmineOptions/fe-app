import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
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
      <h1>Price Protect</h1>
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
