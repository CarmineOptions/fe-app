import { useState } from "react";
import { OptionWithPremia } from "../../classes/Option";
import { OptionModal } from "./OptionModal";
import { Pair } from "../../classes/Pair";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionSide } from "../../types/options";

import { ReactComponent as PlusIcon } from "./plus.svg";

import styles from "./table.module.css";

type Props = {
  options: OptionWithPremia[];
  tokenPair: Pair;
  side: OptionSide | "all";
};

const OptionsTable = ({ options, tokenPair, side }: Props) => {
  const [modalOption, setModalOption] = useState<OptionWithPremia>(options[0]);
  const [open, setOpen] = useState<boolean>(false);
  const basePrice = useCurrency(tokenPair.baseToken.id);
  const quotePrice = useCurrency(tokenPair.quoteToken.id);

  const priceReady = basePrice !== undefined && quotePrice !== undefined;

  const handleOptionClick = (o: OptionWithPremia) => {
    setModalOption(o);
    setOpen(true);
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
        <div>strike</div>
        {(side === OptionSide.Long || side === "all") && (
          <div>
            <div className={styles.header}>
              <span className="darkgreytext">ask price</span>
              <span className="greentext">/ long</span>
            </div>
          </div>
        )}
        {(side === OptionSide.Short || side === "all") && (
          <div>
            <div className={styles.header}>
              <span className="darkgreytext">ask price</span>
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

          return (
            <>
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
              <div key={i} className="tableitem">
                <div>${o.strike}</div>
                {(side === OptionSide.Long || side === "all") && (
                  <div
                    className={`${styles.premiacontainer} ${styles.long}`}
                    onClick={() => handleOptionClick(o)}
                  >
                    {o.premia.toFixed(3)} {tokenPair.baseToken.symbol}{" "}
                    <div className={styles.square}>
                      <PlusIcon />
                    </div>
                  </div>
                )}
                {side === OptionSide.Short && (
                  <div
                    className={`${styles.premiacontainer} ${styles.short}`}
                    onClick={() => handleOptionClick(o)}
                  >
                    {o.premia.toFixed(3)} {o.symbol}{" "}
                    <div className={styles.square}>
                      <PlusIcon />
                    </div>
                  </div>
                )}
                {side === "all" && (
                  <div
                    className={`${styles.premiacontainer} ${styles.short}`}
                    onClick={() => handleOptionClick(short!)}
                  >
                    {short!.premia.toFixed(3)} {o.symbol}{" "}
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
            </>
          );
        })}
      </div>
      <OptionModal open={open} setOpen={setOpen} option={modalOption} />
    </>
  );
};

export default OptionsTable;
