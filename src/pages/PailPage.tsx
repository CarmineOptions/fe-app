import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { Pail } from "../components/PAIL";
import { H4 } from "../components/common";

const PailPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>PAIL | Carmine Options AMM</title>
        <meta
          name="description"
          content="Protection Against Impermanent Loss"
        />
      </Helmet>
      <div className="flex flex-col gap-10">
        <H4>Protection Against Impermanent Loss</H4>
        <Pail />
      </div>
    </Layout>
  );
};

export default PailPage;
