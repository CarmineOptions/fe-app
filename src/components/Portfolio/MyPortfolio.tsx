import { useState } from "react";
import styles from "./portfolio.module.css";
import { MyOptions } from "./MyOptions";
import { Tooltip } from "@mui/material";
import { MyStake } from "./MyStake";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { fetchCapital } from "../WithdrawCapital/fetchCapital";
import { OptionWithPosition } from "../../classes/Option";
import { useCurrencies } from "../../hooks/useCurrencies";
import { TokenPriceData } from "../../types/api";
import { UserPoolInfo } from "../../classes/Pool";

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
  const account = useAccount();
  const prices = useCurrencies();
  const { data: positions } = useQuery(
    [QueryKeys.position, account?.address || "0x0"],
    fetchPositions
  );
  const { data: stakes } = useQuery(
    [QueryKeys.stake, account?.address],
    fetchCapital
  );
  const [options, setOptions] = useState<"live" | "itm" | "otm">("live");

  const { positionsValueUsd, stakesValueUsd, totalValueUsd } =
    calcPortfolioValue(positions, stakes, prices);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div>
          <span>portfolio value</span>
          <span>
            ${totalValueUsd === undefined ? "--" : totalValueUsd.toFixed(2)}
          </span>
        </div>
        <div>
          <span>options</span>
          <span>
            $
            {positionsValueUsd === undefined
              ? "--"
              : positionsValueUsd.toFixed(2)}
          </span>
        </div>
        <div>
          <span>yield</span>
          <span>
            ${stakesValueUsd === undefined ? "--" : stakesValueUsd.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <div className={styles.options}>
          <div>
            <h1>Options</h1>
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
      <div className="divider"></div>
      <div>
        <h1>Staking</h1>
        <MyStake />
      </div>
    </div>
  );
};
