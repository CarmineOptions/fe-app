import { OptionSide, OptionType } from "../../types/options";
import { useState } from "react";
import OptionsTable from "./OptionsTable";
import { isCall, isLong, uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { Pair, PairKey } from "../../classes/Pair";
import { InfoIcon } from "../InfoIcon";

import { useOptions } from "../../hooks/useOptions";
import { useSearchParams } from "react-router-dom";
import { Button } from "../common/Button";
import { TokenPairSelect } from "../TokenPairSelect";
import { Divider } from "../common";

const getText = (type: OptionType, side: OptionSide | "all") => {
  if (side === "all") {
    return `We currently do not have any ${
      isCall(type) ? "call" : "put"
    } options.`;
  }
  return `We currently do not have any ${isLong(side) ? "long" : "short"} ${
    isCall(type) ? "call" : "put"
  } options.`;
};

const queryParamsToPool = (param: string | null): [PairKey, OptionType] => {
  const defaultPool = [PairKey.STRK_USDC, OptionType.Call] as [
    PairKey,
    OptionType
  ];
  if (!param) {
    // default pool
    return defaultPool;
  }
  const [encodedPool, poolType] = param.split("-");

  if (!encodedPool || !poolType) {
    return defaultPool;
  }

  const decodedPool = encodedPool.replace("_", " / ");

  if (!Object.values(PairKey).includes(decodedPool as PairKey)) {
    return defaultPool;
  }

  if (poolType === "call") {
    return [decodedPool as PairKey, OptionType.Call];
  }
  if (poolType === "put") {
    return [decodedPool as PairKey, OptionType.Put];
  }
  return defaultPool;
};

const poolToQeuryParam = (pair: PairKey, poolType: OptionType): string => {
  return `${pair.replace(" / ", "_")}-${
    poolType === OptionType.Call ? "call" : "put"
  }`;
};

export const TradeTable = () => {
  const { isLoading, isError, options } = useOptions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [side, setSide] = useState<OptionSide.Long | OptionSide.Short | "all">(
    "all"
  );
  const [maturity, setMaturity] = useState<number | undefined>();

  const [initialPair, initialType] = queryParamsToPool(
    searchParams?.get("pool")
  );

  const [type, setCallPut] = useState<OptionType>(initialType);

  const [pair, setPair] = useState<Pair>(Pair.pairByKey(initialPair));

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

  const thisPairOptions = options.filter((option) =>
    option.isPair(pair.pairId)
  );

  const maturities = thisPairOptions
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues);

  if (maturity === undefined || !maturities.includes(maturity)) {
    if (maturities.length) {
      setMaturity(maturities[0]);
    }
  }

  const filtered = thisPairOptions
    .filter(
      (option) =>
        (side === "all" ? true : option.isSide(side)) &&
        option.isType(type) &&
        option.maturity === maturity
    )
    .sort((a, b) => a.strike - b.strike);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const handleTypeChange = (newType: OptionType) => {
    setCallPut(newType);
    setSearchParams((prev) => {
      prev.set("pool", poolToQeuryParam(pair.pairId, newType));
      return prev;
    });
  };

  return (
    <div className="flex flex-col gap-[28px] justify-between">
      <TokenPairSelect pair={pair} setPair={setPair} />
      <div className="flex items-center flex-wrap gap-1 p-2">
        <div className="flex gap-1">
          <Button
            outlined={type === OptionType.Put}
            onClick={() => handleTypeChange(OptionType.Call)}
          >
            calls
          </Button>
          <Button
            outlined={type === OptionType.Call}
            onClick={() => handleTypeChange(OptionType.Put)}
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
            outlined={side !== OptionSide.Long}
            onClick={() => setSide(OptionSide.Long)}
          >
            long
          </Button>
          <Button
            type="error"
            outlined={side !== OptionSide.Short}
            onClick={() => setSide(OptionSide.Short)}
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
          <span className="text-dark-secondary text-[12px] pr-1">MATURITY</span>
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
      <div>
        {isLoading && (
          <div>
            <LoadingAnimation size={40} />
          </div>
        )}
        {isError && <NoContent text="Option not available at the moment" />}
        {!isLoading && !isError && filtered.length === 0 ? (
          <NoContent text={getText(type, side)} />
        ) : (
          <OptionsTable options={filtered} tokenPair={pair} side={side} />
        )}
      </div>
    </div>
  );
};
