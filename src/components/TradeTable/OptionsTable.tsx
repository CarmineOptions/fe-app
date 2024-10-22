import { OptionWithPremia } from "../../classes/Option";
import { Pair } from "../../classes/Pair";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionSide } from "../../types/options";

import { ReactComponent as PlusIcon } from "./plus.svg";

import styles from "./table.module.css";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { OptionSidebar } from "../Sidebar";
import { TokenKey } from "../../classes/Token";

type Props = {
  options: OptionWithPremia[];
  tokenPair: Pair;
  side: OptionSide | "all";
};

const OptionsTable = ({ options, tokenPair, side }: Props) => {
  const basePrice = useCurrency(tokenPair.baseToken.id);
  const quotePrice = useCurrency(tokenPair.quoteToken.id);

  const priceReady = basePrice !== undefined && quotePrice !== undefined;

  const handleOptionClick = (o: OptionWithPremia) => {
    setSidebarContent(<OptionSidebar option={o} />);
    openSidebar();
    o.sendViewEvent();
  };

  const filtered = options.filter(
    (o) => side !== "all" || o.side === OptionSide.Long
  );

  const index =
    priceReady && filtered.findIndex((o) => o.strike > basePrice / quotePrice);

  return (
    <>
      <div className="tableheader">
        <div>
          <span className="greytext">strike</span>
        </div>
        {(side === OptionSide.Long || side === "all") && (
          <div>
            <div className={styles.header}>
              <span className="greytext">ask price</span>
              <span className="greentext">/ long</span>
            </div>
          </div>
        )}
        {(side === OptionSide.Short || side === "all") && (
          <div>
            <div className={styles.header}>
              <span className="greytext">bid price</span>
              <span className="redtext">/ short</span>
            </div>
          </div>
        )}
      </div>
      <div className="tablecontent">
        {filtered.map((o, i) => {
          const short = options.find(
            (other) =>
              other.side === OptionSide.Short &&
              other.strike === o.strike &&
              other.maturity === o.maturity
          );

          if (side === "all" && short === undefined) {
            return null;
          }

          const isBtc =
            o.baseToken.id === TokenKey.BTC || o.quoteToken.id === TokenKey.BTC;

          return (
            <div key={i}>
              {priceReady && index !== false && index === i && (
                <div className={styles.price}>
                  <div></div>
                  <div>
                    {tokenPair.baseToken.symbol} / {tokenPair.quoteToken.symbol}{" "}
                    {(basePrice / quotePrice).toFixed(3)}
                  </div>
                  <div></div>
                </div>
              )}
              <div className="tableitem">
                <div>${o.strike}</div>
                {(side === OptionSide.Long || side === "all") && (
                  <div
                    className={`${styles.premiacontainer} ${styles.long}`}
                    onClick={() => handleOptionClick(o)}
                  >
                    {o.premia.toFixed(3)} {o.symbol}{" "}
                    {isBtc && <span className="l2">size 0.1</span>}
                    <div className={styles.square}>
                      <PlusIcon />
                    </div>
                  </div>
                )}
                {(side === OptionSide.Short || side === "all") && (
                  <div
                    className={`${styles.premiacontainer} ${styles.short}`}
                    onClick={() => handleOptionClick(o)}
                  >
                    {o.premia.toFixed(3)} {o.symbol}{" "}
                    {isBtc && <span className="l2">size 0.1</span>}
                    <div className={styles.square}>
                      <PlusIcon />
                    </div>
                  </div>
                )}
              </div>
              {priceReady && index === -1 && i === filtered.length - 1 && (
                <div className={styles.price}>
                  <div></div>
                  <div>
                    {tokenPair.baseToken.symbol} / {tokenPair.quoteToken.symbol}{" "}
                    {(basePrice / quotePrice).toFixed(3)}
                  </div>
                  <div></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default OptionsTable;
