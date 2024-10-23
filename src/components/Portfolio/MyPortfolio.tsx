import { useState } from "react";
import styles from "./portfolio.module.css";
import { MyOptions } from "./MyOptions";
import { Tooltip } from "@mui/material";
import { MyStake } from "./MyStake";
import { OptionWithPosition } from "../../classes/Option";
import { useCurrencies } from "../../hooks/useCurrencies";
import { TokenPriceData } from "../../types/api";
import { UserPoolInfo } from "../../classes/Pool";
import { usePositions } from "../../hooks/usePositions";
import { useStakes } from "../../hooks/useStakes";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";

const calcPositionsValue = (
  positions: OptionWithPosition[],
  prices: TokenPriceData
): number => {
  const values = positions
    .filter((opt) => opt.value > 0)
    .map((opt) => opt.value * prices[opt.underlying.id]);

  return values.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
};

const calcStakesValue = (
  stakes: UserPoolInfo[],
  prices: TokenPriceData
): number => {
  const values = stakes
    .filter((stake) => stake.value > 0)
    .map((stake) => stake.value * prices[stake.underlying.id]);

  return values.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
};

type PortfolioValue = {
  positionsValueUsd?: number;
  stakesValueUsd?: number;
  totalValueUsd?: number;
};

const calcPortfolioValue = (
  positions?: OptionWithPosition[],
  stakes?: UserPoolInfo[],
  prices?: TokenPriceData
): PortfolioValue => {
  const res: PortfolioValue = {
    positionsValueUsd: undefined,
    stakesValueUsd: undefined,
    totalValueUsd: undefined,
  };

  if (prices === undefined) {
    // cant figure out anything
    return res;
  }

  if (positions) {
    res.positionsValueUsd = calcPositionsValue(positions, prices);
  }

  if (stakes) {
    res.stakesValueUsd = calcStakesValue(stakes, prices);
  }

  if (res.positionsValueUsd !== undefined && res.stakesValueUsd !== undefined) {
    res.totalValueUsd = res.positionsValueUsd + res.stakesValueUsd;
  }

  return res;
};

export const MyPortfolio = () => {
  const prices = useCurrencies();
  const { data: positions } = usePositions();
  const { stakes } = useStakes();
  const [options, setOptions] = useState<"live" | "itm" | "otm">("live");

  const { positionsValueUsd, stakesValueUsd, totalValueUsd } =
    calcPortfolioValue(positions, stakes, prices);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div>
          <p className="secondary-col">PORTFOLIO VALUE</p>
          {totalValueUsd === undefined ? (
            <div className={styles.loadingcontainer}>
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <h3>${formatNumber(totalValueUsd)}</h3>
          )}
        </div>
        <div>
          <p className="secondary-col">OPTIONS</p>
          {positionsValueUsd === undefined ? (
            <div className={styles.loadingcontainer}>
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <h3>${formatNumber(positionsValueUsd)}</h3>
          )}
        </div>
        <div>
          <p className="secondary-col">STAKING</p>
          {stakesValueUsd === undefined ? (
            <div className={styles.loadingcontainer}>
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <h3>${formatNumber(stakesValueUsd)}</h3>
          )}
        </div>
      </div>
      <div className="divider topmargin botmargin" />
      <div>
        <div className={styles.options}>
          <div className="botmargin">
            <h2>Options</h2>
            <div className={styles.buttons}>
              <button
                onClick={() => setOptions("live")}
                className={options === "live" ? "active primary" : ""}
              >
                live
              </button>
              <Tooltip title="Options that expired In the Money - can be settled to claim profit.">
                <button
                  onClick={() => setOptions("itm")}
                  className={options === "itm" ? "active primary" : ""}
                >
                  expired itm
                </button>
              </Tooltip>
              <Tooltip title="Options that expired Out of the Money - can be settled, but there is no profit.">
                <button
                  onClick={() => setOptions("otm")}
                  className={options === "otm" ? "active primary" : ""}
                >
                  expired otm
                </button>
              </Tooltip>
            </div>
          </div>
          <MyOptions state={options} />
        </div>
      </div>
      <div className="divider topmargin botmargin" />
      <div>
        <h2 className="botmargin">Staking</h2>
        <MyStake />
      </div>
    </div>
  );
};
