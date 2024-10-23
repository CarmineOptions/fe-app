import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { PointsLeaderboard } from "../components/Points";
import { Helmet } from "react-helmet";

const LeaderboardPage = () => {
  useEffect(() => {
    document.title = "Points | Carmine Finance";
  });

  return (
    <Layout>
      <Helmet>
        <title>Leaderboard | Carmine Options AMM</title>
        <meta name="description" content="Earn points to move up the ladder!" />
      </Helmet>
      <div className="gapcolumn">
        <h1>Carmine Points Program</h1>
        <p>Elevate Your Status, Enhance Your Rewards</p>
        <p>Season 2 is now live!</p>
        <h2>Leaderboard</h2>
        <PointsLeaderboard />
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
