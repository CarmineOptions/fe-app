import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { Leaderboard } from "../components/Points";
import { Helmet } from "react-helmet";

import styles from "./leaderboard.module.css";

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
      <div className={styles.container}>
        <h1>Carmine Points Program</h1>
        <p>Elevate Your Status, Enhance Your Rewards</p>
        <p>Season 2 is now live!</p>
        <h2>Leaderboard</h2>
        <Leaderboard />
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
