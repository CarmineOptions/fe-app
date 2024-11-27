import { useState } from "react";
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
import { Button, Divider, H4, H5, P3 } from "../common";

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
    <div className="flex flex-col gap-7">
      <div className="flex gap-7">
        <div>
          <P3 className="text-dark-secondary">PORTFOLIO VALUE</P3>
          {totalValueUsd === undefined ? (
            <div className="w-14 h-8">
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <H5>${formatNumber(totalValueUsd)}</H5>
          )}
        </div>
        <div>
          <P3 className="text-dark-secondary">OPTIONS</P3>
          {positionsValueUsd === undefined ? (
            <div className="w-14 h-8">
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <H5>${formatNumber(positionsValueUsd)}</H5>
          )}
        </div>
        <div>
          <P3 className="text-dark-secondary">STAKING</P3>
          {stakesValueUsd === undefined ? (
            <div className="w-14 h-8">
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <H5>${formatNumber(stakesValueUsd)}</H5>
          )}
        </div>
      </div>
      <Divider className="my-6" />
      <div>
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-center gap-7 mb-6">
            <H4>Options</H4>
            <div className="flex gap-1">
              {["live", "itm", "otm"].map((opt, i) => {
                const isActive = options === opt;
                const tooltipMsg =
                  opt === "live"
                    ? "Options that have not expired yet."
                    : opt === "itm"
                    ? "Options that expired In the Money - can be settled to claim profit."
                    : "Options that expired Out of the Money - can be settled, but there is no profit.";
                return (
                  <Tooltip title={tooltipMsg}>
                    <Button
                      key={i}
                      type={isActive ? "primary" : "secondary"}
                      outlined={!isActive}
                      onClick={() => setOptions(opt as "live" | "itm" | "otm")}
                      className={options === opt ? "active primary" : ""}
                    >
                      {opt === "live" && "live"}
                      {opt === "itm" && "expired itm"}
                      {opt === "otm" && "expired otm"}
                    </Button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          <MyOptions state={options} />
        </div>
      </div>
      <Divider className="my-6" />
      <div>
        <H4>Staking</H4>
        <MyStake />
      </div>
    </div>
  );
};
