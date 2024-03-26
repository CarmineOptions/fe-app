import { useEffect } from "react";

import { Layout } from "../components/layout";
import { Leaderboard } from "../components/Points/Leaderboard";

const PointsPage = () => {
  useEffect(() => {
    document.title = "Points | Carmine Finance";
  });

  return (
    <Layout>
      <h3>Leaderboard</h3>
      <Leaderboard />
    </Layout>
  );
};

export default PointsPage;
