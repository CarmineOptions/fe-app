import { Helmet } from "react-helmet";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Airdrop } from "../components/Airdrop/Airdrop";
import { Layout } from "../components/Layout";
import { TradeHistory } from "../components/History/History";
import { usePortfolioParam } from "../hooks/usePortfolio";
import { setPortfolioParam } from "../redux/actions";
import { PortfolioParamType } from "../redux/reducers/ui";
import { Referral } from "../components/Referral";
import { isMainnet } from "../constants/amm";
import { MyPortfolio } from "../components/Portfolio";

import styles from "./portfolio.module.css";

const Portfolio = () => {
  const portfolioParam = usePortfolioParam();
  const navigate = useNavigate();
  const { target } = useParams();

  useEffect(() => {
    // Check if the URL contains the #history hash
    switch (target) {
      case "history":
        setPortfolioParam(PortfolioParamType.History);
        break;
      case "airdrop":
        setPortfolioParam(PortfolioParamType.AirDrop);
        break;
      case "my-portfolio":
        setPortfolioParam(PortfolioParamType.MyPortfolio);
        break;
      case "referral":
        setPortfolioParam(PortfolioParamType.Referral);
        break;
      default:
        switch (portfolioParam) {
          case PortfolioParamType.History:
            setPortfolioParam(PortfolioParamType.History);
            break;
          case PortfolioParamType.AirDrop:
            setPortfolioParam(PortfolioParamType.AirDrop);
            break;
          case PortfolioParamType.MyPortfolio:
            setPortfolioParam(PortfolioParamType.MyPortfolio);
            break;
          case PortfolioParamType.Referral:
            setPortfolioParam(PortfolioParamType.Referral);
            break;
          default:
            setPortfolioParam(PortfolioParamType.MyPortfolio);
            break;
        }
        break;
    }
  }, [target, portfolioParam]);

  return (
    <Layout>
      <Helmet>
        <title>Portfolio | Carmine Options AMM</title>
        <meta
          name="description"
          content="Your current positions and history of your activity"
        />
      </Helmet>
      <div className={styles.header}>
        {[
          PortfolioParamType.MyPortfolio,
          PortfolioParamType.AirDrop,
          PortfolioParamType.History,
          PortfolioParamType.Referral,
        ].map((subpage, i) => (
          <h1
            key={i}
            className={portfolioParam === subpage ? "" : styles.inactive}
            onClick={() => {
              navigate(`/portfolio/${subpage}`);
            }}
          >
            {subpage === PortfolioParamType.MyPortfolio && "My Portfolio"}
            {subpage === PortfolioParamType.AirDrop && "Airdrops"}
            {subpage === PortfolioParamType.History && "History"}
            {subpage === PortfolioParamType.Referral && "Referral"}
          </h1>
        ))}
      </div>
      {portfolioParam === PortfolioParamType.AirDrop && (
        <div>
          <Airdrop />
        </div>
      )}
      {portfolioParam === PortfolioParamType.MyPortfolio && (
        <div>
          <MyPortfolio />
        </div>
      )}
      {portfolioParam === PortfolioParamType.History && (
        <div>
          <TradeHistory />
        </div>
      )}
      {isMainnet && portfolioParam === PortfolioParamType.Referral && (
        <div>
          <Referral />
        </div>
      )}
    </Layout>
  );
};

export default Portfolio;
