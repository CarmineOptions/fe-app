import { ReactNode, useState } from "react";
import OptionsTable from "./OptionsTable";
import { uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { Pair } from "../../classes/Pair";
import { InfoIcon } from "../InfoIcon";

import { useOptions } from "../../hooks/useOptions";
import { useSearchParams } from "react-router-dom";
import { Button } from "../common/Button";
import { TokenPairSelect } from "../TokenPairSelect";
import { Divider, H4, P3 } from "../common";
import { TradingViewMultichart } from "../CryptoGraph";

import {
  allLiquidityPools,
  LiquidityPool,
  liquidityPoolByAddress,
  liquidityPoolBySymbol,
  OptionSide,
  OptionType,
} from "@carmine-options/sdk/core";

export const TradeTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lpAddressMaybe = searchParams?.get("pool");
  const fallbackPool = allLiquidityPools[0];
  const initialPool = lpAddressMaybe
    ? allLiquidityPools.find((p) => p.lpAddress === lpAddressMaybe) ||
      fallbackPool
    : fallbackPool;

  const [pool, setPool] = useState<LiquidityPool>(initialPool);
  const pair = new Pair(pool.base.address, pool.quote.address);
  const { isLoading, isError, error, options } = useOptions(pool.lpAddress);
  const [side, setSide] = useState<OptionSide | "all">("all");
  const [maturity, setMaturity] = useState<number | undefined>();

  const handleTypeChange = (newType: OptionType) => {
    const newPoolMaybe = liquidityPoolBySymbol(
      pool.base.symbol,
      pool.quote.symbol,
      newType
    );

    if (newPoolMaybe.isSome) {
      const newPool = newPoolMaybe.unwrap();
      setPool(newPool);
      setSearchParams((prev) => {
        prev.set("pool", newPool.lpAddress);
        return prev;
      });
    }
  };

  const handlePairChange = (newPair: Pair) => {
    const newPoolMaybe = liquidityPoolByAddress(
      newPair.baseToken.address,
      newPair.quoteToken.address,
      pool.optionType
    );

    if (newPoolMaybe.isSome) {
      const newPool = newPoolMaybe.unwrap();
      setPool(newPool);
      setSearchParams((prev) => {
        prev.set("pool", newPool.lpAddress);
        return prev;
      });
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  type HeaderProps = {
    maturities: number[];
    children: ReactNode;
  };

  const Header = ({ maturities, children }: HeaderProps) => {
    return (
      <div className="flex flex-col gap-[28px] justify-between">
        <TokenPairSelect pair={pair} setPair={handlePairChange} />
        <div className="flex items-center flex-wrap gap-1 p-2">
          <div className="flex gap-1">
            <Button
              outlined={pool.optionType === 1}
              onClick={() => handleTypeChange(0)}
            >
              calls
            </Button>
            <Button
              outlined={pool.optionType === 0}
              onClick={() => handleTypeChange(1)}
            >
              puts
            </Button>
          </div>
          <InfoIcon
            text="CALL: Right to buy at a strike price. Its value rises if the underlying asset's price goes up.
PUT: Right to sell at a strike price. Its value rises if the underlying asset's price goes down."
            size="18px"
          />
          <Divider className="grow mr-2" />
          <div className="flex gap-1">
            <Button outlined={side !== "all"} onClick={() => setSide("all")}>
              all
            </Button>
            <Button
              type="success"
              outlined={side !== 0}
              onClick={() => setSide(0)}
            >
              long
            </Button>
            <Button
              type="error"
              outlined={side !== 1}
              onClick={() => setSide(1)}
            >
              short
            </Button>
          </div>
          <InfoIcon
            text="LONG: Buy a right to buy/sell (for Call/Put) underlying asset at strike price. Buying an option means that you have the right to decide whether to buy (call) or sell (put) the asset. When buying you pay premium.
SHORT: Sell a right to buy/sell (for Call/Put) underlying asset at strike price. Shorting an option means that you are obliged to buy (put) or sell (call) the asset. When selling you receive premium."
            size="18px"
          />
          <Divider className="grow mr-2" />
          <div className="flex wrap gap-1 items-center">
            <span className="text-dark-secondary text-[12px] pr-1">
              MATURITY
            </span>
            {maturities
              .sort((a, b) => a - b)
              .map((m, i) => (
                <Button
                  onClick={() => setMaturity(m)}
                  outlined={m !== maturity}
                  key={i}
                >
                  {formatTimestamp(m)}
                </Button>
              ))}
          </div>
          <InfoIcon text="The expiration date of the option." size="18px" />
          <Divider className="grow mr-2" />
        </div>
        <div>{children}</div>
        <Divider className="my-4" />
        <H4>Chart</H4>
        <div className="flex justify-evenly gap-10">
          <div className="w-full min-w-[45%] h-[500px]">
            <TradingViewMultichart pair={pair.pairId} />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Header
        maturities={[]}
        children={
          <div className="h-80">
            <LoadingAnimation size={40} />
          </div>
        }
      />
    );
  }

  if (isError || !options) {
    console.log("Failed getting options", error);
    return (
      <Header
        maturities={[]}
        children={<P3 className="font-semibold pb-6">Something went wrong</P3>}
      />
    );
  }

  const maturities = options
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues);

  if (maturity === undefined || !maturities.includes(maturity)) {
    if (maturities.length) {
      setMaturity(maturities[0]);
    }
  }

  const filtered = options
    .filter(
      (option) =>
        (side === "all" ? true : option.optionSide === Number(side)) &&
        option.maturity === maturity
    )
    .sort((a, b) => a.strikePrice.val - b.strikePrice.val);

  if (filtered.length === 0) {
    console.log("Failed getting options", error);
    return (
      <Header
        maturities={[]}
        children={
          <P3 className="font-semibold pb-6">
            There are currently no options for this selection.
          </P3>
        }
      />
    );
  }

  return (
    <Header
      maturities={maturities}
      children={
        <OptionsTable options={filtered} tokenPair={pair} side={side} />
      }
    />
  );
};
