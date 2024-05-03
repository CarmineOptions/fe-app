import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Rewards } from "../components/DefiSpringRewards";

const StarknetRewards = () => (
  <Layout>
    <Helmet>
      <title>Starknet Rewards | Carmine Options AMM</title>
      <meta name="description" content="Claim STRK rewards" />
    </Helmet>
    <h3>Starknet DeFi Spring</h3>
    <Rewards />
  </Layout>
);

export default StarknetRewards;
