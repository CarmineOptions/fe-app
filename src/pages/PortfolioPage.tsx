import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { MyPortfolio } from "../components/Portfolio";

const PortfolioPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Portfolio | Carmine Options AMM</title>
        <meta
          name="description"
          content="Your current positions and history of your activity"
        />
      </Helmet>
      <MyPortfolio />
    </Layout>
  );
};

export default PortfolioPage;
