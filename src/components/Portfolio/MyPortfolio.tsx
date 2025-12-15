import { useState } from "react";
import { MyOptions } from "./MyOptions";
import { Tooltip } from "@mui/material";
import { MyStake } from "./MyStake";
import { usePositions } from "../../hooks/usePositions";
import { useStakes } from "../../hooks/useStakes";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";
import { Button, Divider, H4, H5, P3 } from "../common";
import {
  liquidityPoolByLpAddress,
  OptionWithUserPosition,
  UserPoolInfo,
} from "@carmine-options/sdk/core";
import { usePrices } from "../../hooks/usePrice";
import { LivePrices } from "@carmine-options/sdk/api";

const getPrice = (s: string, p: LivePrices) => {
  if (s in p) {
    const price = p[s as keyof typeof p] as number;
    return price;
  }
  throw Error(`Cannot get price for ${s}`);
};

const calcPositionsValue = (
  positions: OptionWithUserPosition[],
  prices: LivePrices
): number => {
  const values = positions
    .filter((opt) => opt.value.val > 0)
    .map((opt) => opt.value.val * getPrice(opt.underlying.symbol, prices));

  return values.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
};

const calcStakesValue = (
  stakes: UserPoolInfo[],
  prices: LivePrices
): number => {
  const values = stakes
    .filter((stake) => stake.value > 0)
    .map((stake) => {
      const pool = liquidityPoolByLpAddress(stake.lpAddress).unwrap();
      return stake.value * getPrice(pool.underlying.symbol, prices);
    });

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
  positions?: OptionWithUserPosition[],
  stakes?: UserPoolInfo[],
  prices?: LivePrices
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
  const { data: prices } = usePrices();
  const { data: positions } = usePositions();
  const { data: stakes } = useStakes();
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
              <div>
                <Button
                  type={options === "live" ? "primary" : "secondary"}
                  outlined={options !== "live"}
                  onClick={() => setOptions("live")}
                >
                  live
                </Button>
              </div>
              <Tooltip title="Options that expired In the Money - can be settled to claim profit.">
                <div>
                  <Button
                    type={options === "itm" ? "primary" : "secondary"}
                    outlined={options !== "itm"}
                    onClick={() => setOptions("itm")}
                  >
                    expired itm
                  </Button>
                </div>
              </Tooltip>
              <Tooltip title="Options that expired Out of the Money - can be settled, but there is no profit.">
                <div>
                  <Button
                    type={options === "otm" ? "primary" : "secondary"}
                    outlined={options !== "otm"}
                    onClick={() => setOptions("otm")}
                  >
                    expired otm
                  </Button>
                </div>
              </Tooltip>
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
