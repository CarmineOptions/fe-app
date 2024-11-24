import { Helmet } from "react-helmet";

import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { Layout } from "../components/Layout";
import StakeCapital from "../components/StakeCapital";
import WithdrawCapital from "../components/WithdrawCapital";
import { CrmBanner } from "../components/Banner";

const StakePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Staking | Carmine Options AMM</title>
        <meta
          name="description"
          content="Provide liquidity to liquidity pools and earn share of the fees"
        />
      </Helmet>
      <CrmBanner />

      <Tooltip title="Click to learn more">
        <RouterLink
          style={{ textDecoration: "none", color: "inherit" }}
          to="/staking-explained"
        >
          <h3 style={{ display: "inline" }}>
            Stake Capital <Info />
          </h3>
        </RouterLink>
      </Tooltip>
      <StakeCapital />
      <h3>Withdraw Capital</h3>
      <WithdrawCapital />
    </Layout>
  );
};

export default StakePage;
