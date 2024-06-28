import { Helmet } from "react-helmet";

import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { Layout } from "../components/Layout";
import StakeCapital from "../components/StakeCapital";
import WithdrawCapital from "../components/WithdrawCapital";
import { useSelector } from "react-redux";
import { uint256toDecimal } from "../utils/units";
import styles from "./insurance.module.css";

const StakePage = () => {
  const balance = useSelector((state: any) => state.wallet.balance);

  return (
    <Layout>
      <Helmet>
        <title>Staking | Carmine Options AMM</title>
        <meta
          name="description"
          content="Provide liquidity to liquidity pools and earn share of the fees"
        />
      </Helmet>
      <div className={styles.container}>
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
        {
          balance && <h4>Balance: {uint256toDecimal(balance.strk, 18)} STRK</h4>
        }
      </div>
      <StakeCapital />
      <h3>Withdraw Capital</h3>
      <WithdrawCapital />
    </Layout>
  );
};

export default StakePage;
