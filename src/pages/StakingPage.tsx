import { Helmet } from "react-helmet";

import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { Layout } from "../components/Layout";
import StakeCapital from "../components/StakeCapital";
import WithdrawCapital from "../components/WithdrawCapital";
import { H5 } from "../components/common";

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
      <Tooltip title="Click to learn more">
        <RouterLink className="no-underline" to="/staking-explained">
          <H5 className="inline-block">
            Stake Capital <Info />
          </H5>
        </RouterLink>
      </Tooltip>
      <StakeCapital />
      <H5>Withdraw Capital</H5>
      <WithdrawCapital />
    </Layout>
  );
};

export default StakePage;
