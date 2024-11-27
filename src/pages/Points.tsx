import { Layout } from "../components/Layout";
import { PointsLeaderboard } from "../components/Points";
import { Helmet } from "react-helmet";
import { H4, H5, P3 } from "../components/common";

const PointsPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Leaderboard | Carmine Options AMM</title>
        <meta name="description" content="Earn points to move up the ladder!" />
      </Helmet>
      <div className="flex flex-col gap-7">
        <H4>Carmine Points Program</H4>
        <P3>Elevate Your Status, Enhance Your Rewards</P3>
        <P3>Season 2 is now live!</P3>
        <H5>Leaderboard</H5>
        <PointsLeaderboard />
      </div>
    </Layout>
  );
};

export default PointsPage;
