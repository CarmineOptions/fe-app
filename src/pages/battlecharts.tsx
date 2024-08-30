import { Layout } from "../components/Layout";
import { Helmet } from "react-helmet";
import { NotionalVolumeLeaderboard } from "../components/PnL";

const BattlechartsPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Battlecharts | Carmine Options AMM</title>
        <meta name="description" content="Trading leaderboard" />
      </Helmet>
      <h3>Trading Leaderboard</h3>
      <NotionalVolumeLeaderboard />
    </Layout>
  );
};

export default BattlechartsPage;
