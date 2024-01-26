import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Layout } from "../components/layout";
import StakeCapital from "../components/StakeCapital";
import WithdrawCapital from "../components/WithdrawCapital";

const StakePage = () => {
  useEffect(() => {
    document.title = "Stake Capital | Carmine Finance";
  });

  return (
    <Layout>
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
