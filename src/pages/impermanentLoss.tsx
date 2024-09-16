import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { ImpermanentLossWidget } from "../components/ImpermanentLoss";

const ImpermanentLossPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Impermanent Loss | Carmine Options AMM</title>
        <meta name="description" content="TODO" />
      </Helmet>
      <ImpermanentLossWidget />
    </Layout>
  );
};

export default ImpermanentLossPage;
