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
  const [section, setSection] = useState(1);
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
        setSection(2);
        break;
      case "airdrop":
        scrollToTarget(airDrop);
        setSection(0);
        break;
      case "position":
        scrollToTarget(position);
        setSection(1);
        break;
      default:
        scrollToTarget(position);
        setSection(1);
        break;
    }
  }, [target]);

  return (
    <Layout>
        <button
          className={`${buttonStyles.button} ${section===0 && buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/airdrop`); setSection(0);}}
        > Airdrop
        </button>
        <button
          className={`${buttonStyles.button} ${section===1 &&buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={() => {navigate(`/portfolio/position`); setSection(1);}}
        > Position
        </button>
        <button
          className={`${buttonStyles.button} ${section===2 &&buttonStyles.secondary}`}
          onClick={() => {navigate( `/portfolio/history`); setSection(2);}}
        > History
        </button>
      {section === 0&&(<div ref={airDrop}><Airdrop /></div>)}
      {section === 1&&(<div ref={position}><Positions /></div>)}
      {section === 2&&(<h3 id="history">History</h3>)}
      {section === 2&&(      
        <p>
        Please be advised that it takes 5-20 minutes for a transaction to
        appear.
        </p>
      )}
      {section === 2&&(<div ref={history}><TradeHistory/></div>)}

    </Layout>
  );
};

export default Portfolio;
