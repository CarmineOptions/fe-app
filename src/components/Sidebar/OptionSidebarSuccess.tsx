import { PairNamedBadge } from "../TokenBadge";
import { useNavigate } from "react-router-dom";
import { closeSidebar } from "../../redux/actions";
import { OptionWithPremia } from "../../classes/Option";
import poolStyles from "./pool.module.css";
import styles from "./option.module.css";

type Props = {
  option: OptionWithPremia;
  amount: number;
  tx: string;
};

export const OptionSidebarSuccess = ({ option, amount, tx }: Props) => {
  const navigate = useNavigate();

  const handlePortfolioClick = () => {
    navigate("/portfolio");
    closeSidebar();
  };

  const grey = "#444444";

  return (
    <div className={`${poolStyles.sidebar} ${poolStyles.success}`}>
      <div className={poolStyles.successmessage}>
        <span>SUCCESSFUL!</span>
      </div>
      <div className={`${poolStyles.desc} ${poolStyles.success}`}>
        <div className={styles.desc}>
          <PairNamedBadge
            tokenA={option.baseToken}
            tokenB={option.quoteToken}
            size={32}
          />
          <div
            className={
              styles.side + " " + styles[option.sideAsText.toLowerCase()]
            }
          >
            {option.sideAsText}
          </div>
        </div>
      </div>
      <div className={styles.databox}>
        <div>
          <span>OPTION SIZE</span>
        </div>
        <div>
          <span style={{ color: grey }}>{amount}</span>
          <span></span>
        </div>
      </div>
      <div>
        <button
          className={"blackandwhite active mainbutton"}
          onClick={handlePortfolioClick}
        >
          View Portfolio
        </button>
      </div>
      <div className="center">
        <a
          href={`https://starkscan.co/tx/${tx}`}
          target="_blank"
          rel="noreferrer"
          className={poolStyles.txlink}
        >
          View Transaction ↗
        </a>
      </div>
    </div>
  );
};
