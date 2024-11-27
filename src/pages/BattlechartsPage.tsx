import { Layout } from "../components/Layout";
import { Helmet } from "react-helmet";
import { NotionalVolumeLeaderboard } from "../components/PnL";
import { H4 } from "../components/common";

const BattlechartsPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Battlecharts | Carmine Options AMM</title>
        <meta name="description" content="Trading leaderboard" />
      </Helmet>
      <H4>Trading Leaderboard</H4>
      <NotionalVolumeLeaderboard />
    </Layout>
  );
};

export default BattlechartsPage;
