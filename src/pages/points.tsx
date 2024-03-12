import { useEffect } from "react";

import { Layout } from "../components/layout";
import { Leaderboard } from "../components/Points/Leaderboard";
import { UserPoints } from "../components/Points/UserPoints";

const PointsPage = () => {
  useEffect(() => {
    document.title = "Points | Carmine Finance";
  });

  return (
    <Layout>
      <h3>Points</h3>
      <UserPoints />
      <h3>Leaderboard</h3>
      <Leaderboard />
    </Layout>
  );
};

export default PointsPage;
