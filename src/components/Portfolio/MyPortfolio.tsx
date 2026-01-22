import { MyStake } from "./MyStake";
import { useStakes } from "../../hooks/useStakes";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";
import { Divider, H4, H5, P3 } from "../common";
import {
  liquidityPoolByLpAddress,
  UserPoolInfo,
} from "@carmine-options/sdk/core";
import { usePrices } from "../../hooks/usePrice";
import { LivePrices } from "@carmine-options/sdk/api";
import { MyNonSettledOptions } from "./MyNonSettledOptions";

const getPrice = (s: string, p: LivePrices) => {
  if (s === "USDC") {
    return 1;
  }
  if (s in p) {
    const price = p[s as keyof typeof p] as number;
    return price;
  }
  throw Error(`Cannot get price for ${s}`);
};

const calcStakesValue = (
  stakes: UserPoolInfo[],
  prices: LivePrices,
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
  stakesValueUsd?: number;
  totalValueUsd?: number;
};

const calcPortfolioValue = (
  stakes?: UserPoolInfo[],
  prices?: LivePrices,
): PortfolioValue => {
  const res: PortfolioValue = {
    stakesValueUsd: undefined,
    totalValueUsd: undefined,
  };

  if (prices === undefined) {
    // cant figure out anything
    return res;
  }

  if (stakes) {
    const stakeValue = calcStakesValue(stakes, prices);
    res.stakesValueUsd = stakeValue;
    res.totalValueUsd = stakeValue;
  }

  return res;
};

export const MyPortfolio = () => {
  const { data: prices } = usePrices();
  const { data: stakes } = useStakes();

  const { stakesValueUsd, totalValueUsd } = calcPortfolioValue(stakes, prices);

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
          <H5>--</H5>
          {/* {positionsValueUsd === undefined ? (
            <div className="w-14 h-8">
              <LoadingAnimation size={20} />
            </div>
          ) : (
            <H5>${formatNumber(positionsValueUsd)}</H5>
          )} */}
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
          </div>
          <MyNonSettledOptions />
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
