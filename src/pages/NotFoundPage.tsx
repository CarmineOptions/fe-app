import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { H4, P3 } from "../components/common";

const NotFoundPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Page not found | Carmine Options AMM</title>
      </Helmet>
      <H4>404</H4>
      <P3>Sorry, this page does not exist</P3>
    </Layout>
  );
};
export default NotFoundPage;
