import { useEffect, useRef } from "react";

import { Airdrop } from "../components/Airdrop/Airdrop";
import { Layout } from "../components/layout";
import { Positions } from "../components/PositionTable";
import { TradeHistory } from "../components/TradeHistory/TradeHistory";
import buttonStyles from "../style/button.module.css";

const Portfolio = () => {
  const airDrop = useRef<HTMLDivElement>(null);
  const position = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const handleClick= (section: string)=>{
    switch (section){
      case "history":
        if(history.current){
          history.current.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      case "airdrop":
        if(airDrop.current){
          airDrop.current.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      case "position":
          if(position.current){
            position.current.scrollIntoView({ behavior: 'smooth' });
          }
          return;
    }
  }
  useEffect(() => {
    document.title = "Portfolio | Carmine Finance";
    // Check if the URL contains the #history hash
    if (window.location.hash === "#history") {
      // Scroll to the "History" section
      const historySection = document.getElementById("history");
      if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <Layout>
        <button
          className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={()=>handleClick("airdrop")}
        > Airdrop
        </button>
        <button
          className={`${buttonStyles.button} ${buttonStyles.secondary} ${buttonStyles.offset}`}
          onClick={()=>handleClick("position")}
        > Position
        </button>
        <button
          className={`${buttonStyles.button} ${buttonStyles.secondary}`}
          onClick={()=>handleClick("history")}
        > History
        </button>

      <div ref={airDrop}><Airdrop /></div>
      <div ref={position}><Positions /></div>
      <h3 id="history">History</h3>
      <p>
        Please be advised that it takes 5-20 minutes for a transaction to
        appear.
      </p>
      <div ref={history}>
        <TradeHistory/>
      </div>
    </Layout>
  );
};

export default Portfolio;
