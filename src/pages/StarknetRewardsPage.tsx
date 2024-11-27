import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Rewards } from "../components/DefiSpringRewards";
import { StarknetIcon } from "../components/Icons";

const StarknetRewardsPage = () => (
  <Layout>
    <Helmet>
      <title>Starknet Rewards | Carmine Options AMM</title>
      <meta name="description" content="Claim STRK rewards" />
    </Helmet>
    <div className="flex flex-col gap-7">
      <h1>Starknet DeFi Spring</h1>
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        40M
        <StarknetIcon style={{ width: "32px", height: "32px" }} />
        STRK
      </h2>
      <p>
        <b>Carmine Options AMM</b> is part of the Starknet's{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.starknet.io/en/content/starknet-foundation-introduces-the-start-of-defi-spring"
        >
          DeFi Spring
        </a>{" "}
        incentive.
      </p>
      <p>Earn STRK rewards by providing liquidity!</p>
      <Rewards />
    </div>
  </Layout>
);

export default StarknetRewardsPage;
