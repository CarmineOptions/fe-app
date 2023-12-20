import { RefObject, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Airdrop } from "../components/Airdrop/Airdrop";
import { Layout } from "../components/layout";
import { Positions } from "../components/PositionTable";
import { TradeHistory } from "../components/TradeHistory/TradeHistory";
import buttonStyles from "../style/button.module.css";

const Portfolio = () => {
  const airDrop = useRef<HTMLDivElement>(null);
  const position = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const [isAirdrop, setAirDrop] = useState(false);
  const [isPosition, setPosition] = useState(true);
  const [isHistory, setHistory] = useState(false);
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
        break;
      case "airdrop":
        scrollToTarget(airDrop);
        break;
      case "position":
        scrollToTarget(position);
        break;
      default:
        scrollToTarget(position);
        break;
    }
  }, [target]);

  return (
    <Layout>
        <button
          className={`${buttonStyles.button} ${isAirdrop && buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/airdrop`); setAirDrop(!isAirdrop);}}
        > Airdrop
        </button>
        <button
          className={`${buttonStyles.button} ${isPosition &&buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/position`); setPosition(!isPosition)}}
        > Position
        </button>
        <button
          className={`${buttonStyles.button} ${isHistory &&buttonStyles.secondary}`}
          onClick={() => {navigate( `/portfolio/history`); setHistory(!isHistory)}}
        > History
        </button>
      {isAirdrop&&(<div ref={airDrop}><Airdrop /></div>)}
      {isPosition&&(<div ref={position}><Positions /></div>)}
      {isHistory&&(<h3 id="history">History</h3>)}
      {isHistory&&(      
        <p>
        Please be advised that it takes 5-20 minutes for a transaction to
        appear.
        </p>
      )}
      {isHistory&&(<div ref={history}><TradeHistory/></div>)}

    </Layout>
  );
};

export default Portfolio;
