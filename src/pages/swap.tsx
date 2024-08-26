import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { AvnuWidget } from "../components/AvnuWidget";

const SwapPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Swap | Carmine Options AMM</title>
        <meta
          name="description"
          content="Swap crypto assets with Carmine Options AMM"
        />
      </Helmet>
      <AvnuWidget />
    </Layout>
  );
};

export default SwapPage;
