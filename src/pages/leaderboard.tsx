import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { Leaderboard } from "../components/Points";
import { CrmBanner } from "../components/Banner";

const LeaderboardPage = () => {
  useEffect(() => {
    document.title = "Points | Carmine Finance";
  });

  return (
    <Layout>
      <CrmBanner />

      <h3>Carmine Points Program</h3>
      <p>Elevate Your Status, Enhance Your Rewards</p>
      <p>Season 2 is now live!</p>
      <h3>Leaderboard</h3>
      <Leaderboard />
    </Layout>
  );
};

export default LeaderboardPage;
