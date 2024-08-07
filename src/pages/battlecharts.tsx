import { Layout } from "../components/Layout";
import { CrmBanner } from "../components/Banner";
import { Helmet } from "react-helmet";
import { NotionalVolumeLeaderboard } from "../components/PnL";

const BattlechartsPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Battlecharts | Carmine Options AMM</title>
        <meta name="description" content="Trading leaderboard" />
      </Helmet>
      <CrmBanner />
      <h3>Trading Leaderboard</h3>
      <NotionalVolumeLeaderboard />
    </Layout>
  );
};

export default BattlechartsPage;
