import { Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";

const NotFound = () => {
  return (
    <Layout>
      <Helmet>
        <title>Page not found | Carmine Options AMM</title>
      </Helmet>
      <Typography sx={{ mb: 2 }} variant="h4">
        404
      </Typography>
      <Typography>Sorry, this page does not exist</Typography>
    </Layout>
  );
};
export default NotFound;
