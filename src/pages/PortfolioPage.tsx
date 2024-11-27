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
import { H4 } from "../components/common";

const PortfolioPage = () => {
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
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        {[
          PortfolioParamType.MyPortfolio,
          PortfolioParamType.Referral,
          PortfolioParamType.AirDrop,
          PortfolioParamType.History,
        ].map((subpage, i) => (
          <H4
            key={i}
            className={`pb-2 w-fit ${
              portfolioParam === subpage
                ? "border-dark-primary border-b-[1px]"
                : "text-dark-tertiary cursor-pointer"
            }`}
            onClick={() => {
              navigate(`/portfolio/${subpage}`);
            }}
          >
            {subpage === PortfolioParamType.MyPortfolio && "My Portfolio"}
            {subpage === PortfolioParamType.Referral && "Referral"}
            {subpage === PortfolioParamType.AirDrop && "Airdrops"}
            {subpage === PortfolioParamType.History && "History"}
          </H4>
        ))}
      </div>
      {portfolioParam === PortfolioParamType.AirDrop && <Airdrop />}
      {isMainnet && portfolioParam === PortfolioParamType.Referral && (
        <Referral />
      )}
      {portfolioParam === PortfolioParamType.MyPortfolio && <MyPortfolio />}
      {portfolioParam === PortfolioParamType.History && <TradeHistory />}
    </Layout>
  );
};

export default PortfolioPage;
