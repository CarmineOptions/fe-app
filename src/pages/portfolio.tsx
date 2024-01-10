import { RefObject, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Airdrop } from "../components/Airdrop/Airdrop";
import { Layout } from "../components/layout";
import { Positions } from "../components/PositionTable";
import { TradeHistory } from "../components/TradeHistory/TradeHistory";
import { usePortfolioParam } from "../hooks/usePortfolio";
import { setPortfolioParam } from "../redux/actions";
import { PortfolioParamType } from "../redux/reducers/ui";
import buttonStyles from "../style/button.module.css";

const Portfolio = () => {
  const airDrop = useRef<HTMLDivElement>(null);
  const position = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const portfolioParam = usePortfolioParam();
  const navigate = useNavigate();
  const { target } = useParams();
  const scrollToTarget = (targetRef: RefObject<HTMLDivElement>) => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    document.title = "Portfolio | Carmine Finance";
    // Check if the URL contains the #history hash
    switch (target){
      case "history":
        scrollToTarget(history);
        setPortfolioParam(PortfolioParamType.History);
        break;
      case "airdrop":
        scrollToTarget(airDrop);
        setPortfolioParam(PortfolioParamType.AirDrop);
        break;
      case "position":
        scrollToTarget(position);
        setPortfolioParam(PortfolioParamType.Position);
        break;
      default:
        switch (portfolioParam){
          case PortfolioParamType.History:
            scrollToTarget(history);
            setPortfolioParam(PortfolioParamType.History);
            break;
          case PortfolioParamType.AirDrop:
            scrollToTarget(airDrop);
            setPortfolioParam(PortfolioParamType.AirDrop);
            break;
          case PortfolioParamType.Position:
            scrollToTarget(position);
            setPortfolioParam(PortfolioParamType.Position);
            break;
          default:
            scrollToTarget(position);
            setPortfolioParam(PortfolioParamType.Position);
            break;
        }
        break;
    }
  }, [target, portfolioParam]);

  return (
    <Layout>
        <button
          className={`${buttonStyles.button} ${portfolioParam===PortfolioParamType.AirDrop && buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/airdrop`);}}
        > Airdrop
        </button>
        <button
          className={`${buttonStyles.button} ${portfolioParam===PortfolioParamType.Position &&buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/position`);}}
        > Position
        </button>
        <button
          className={`${buttonStyles.button} ${portfolioParam===PortfolioParamType.History &&buttonStyles.secondary}`}
          onClick={() => {navigate( `/portfolio/history`);  }}
        > History
        </button>
      {portfolioParam === PortfolioParamType.AirDrop&&(<div ref={airDrop}><Airdrop /></div>)}
      {portfolioParam === PortfolioParamType.Position&&(<div ref={position}><Positions /></div>)}
      {portfolioParam === PortfolioParamType.History && (
        <div ref={history}>
          <h3 id="history">History</h3>
          <p>
            Please be advised that it takes 5-20 minutes for a transaction to
            appear.
          </p>
          <TradeHistory />
        </div>
      )}
    </Layout>
  );
};

export default Portfolio;
