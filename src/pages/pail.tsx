import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Pail } from "../components/PAIL";

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
      <h1>Protection Against Impermanent Loss</h1>
      <div className={"divider topmargin botmargin"} />
      <Pail />
    </Layout>
  );
};

export default PailPage;
