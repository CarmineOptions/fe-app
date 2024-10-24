import { OptionSide, OptionType } from "../../types/options";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import OptionsTable from "./OptionsTable";
import { isCall, isLong, uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { Pair, PairKey } from "../../classes/Pair";
import { PairNamedBadge } from "../TokenBadge";
import { BtcToken, EthToken, StrkToken, UsdcToken } from "../../classes/Token";
import { InfoIcon } from "../InfoIcon";

import styles from "./tradetable.module.css";
import { useOptions } from "../../hooks/useOptions";

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

export const TradeTable = () => {
  const { isLoading, isError, options } = useOptions();
  const [side, setSide] = useState<OptionSide.Long | OptionSide.Short | "all">(
    "all"
  );
  const [maturity, setMaturity] = useState<number | undefined>();
  const [type, setCallPut] = useState<OptionType>(OptionType.Call);
  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);
  const tokenPair = Pair.pairByKey(pair);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

  const thisPairOptions = options.filter((option) => option.isPair(pair));

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

  const handleChange = (event: SelectChangeEvent) => {
    setPair(event.target.value as PairKey);
  };

  return (
    <div className={styles.container}>
      <div>
        <Select
          value={pair}
          onChange={handleChange}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              { padding: 0 },
            width: "270px",
          }}
        >
          <MenuItem value={PairKey.STRK_USDC}>
            <PairNamedBadge tokenA={StrkToken} tokenB={UsdcToken} />
          </MenuItem>
          <MenuItem value={PairKey.ETH_USDC}>
            <PairNamedBadge tokenA={EthToken} tokenB={UsdcToken} />
          </MenuItem>
          <MenuItem value={PairKey.ETH_STRK}>
            <PairNamedBadge tokenA={EthToken} tokenB={StrkToken} />
          </MenuItem>
          <MenuItem value={PairKey.BTC_USDC}>
            <PairNamedBadge tokenA={BtcToken} tokenB={UsdcToken} />
          </MenuItem>
        </Select>
      </div>
      <div className={styles.buttons}>
        <div>
          <button
            className={type === OptionType.Call ? "primary active" : ""}
            onClick={() => setCallPut(OptionType.Call)}
          >
            calls
          </button>
          <button
            className={type === OptionType.Put ? "primary active" : ""}
            onClick={() => setCallPut(OptionType.Put)}
          >
            puts
          </button>
        </div>
        <InfoIcon
          text="CALL: Right to buy at a strike price. Its value rises if the underlying asset's price goes up.
PUT: Right to sell at a strike price. Its value rises if the underlying asset's price goes down."
          size="18px"
        />
        <div className={"divider " + styles.divider} />
        <div>
          <button
            className={side === "all" ? "secondary active" : "secondary"}
            onClick={() => setSide("all")}
          >
            all
          </button>
          <button
            className={side === OptionSide.Long ? "green active" : "green"}
            onClick={() => setSide(OptionSide.Long)}
          >
            long
          </button>
          <button
            className={side === OptionSide.Short ? "red active" : "red"}
            onClick={() => setSide(OptionSide.Short)}
          >
            short
          </button>
        </div>
        <InfoIcon
          text="LONG: Buy a right to buy/sell (for Call/Put) underlying asset at strike price. Buying an option means that you have the right to decide whether to buy (call) or sell (put) the asset. When buying you pay premium.
SHORT: Sell a right to buy/sell (for Call/Put) underlying asset at strike price. Shorting an option means that you are obliged to buy (put) or sell (call) the asset. When selling you receive premium."
          size="18px"
        />
        <div className={"divider " + styles.divider} />
        <div className="wrap">
          <span className={styles.maturity}>MATURITY</span>
          {maturities
            .sort((a, b) => a - b)
            .map((m, i) => (
              <button
                onClick={() => setMaturity(m)}
                className={m === maturity ? "active secondary" : ""}
                key={i}
              >
                {formatTimestamp(m)}
              </button>
            ))}
        </div>
        <InfoIcon text="The expiration date of the option." size="18px" />
        <div className={"divider " + styles.divider} />
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
          <OptionsTable options={filtered} tokenPair={tokenPair} side={side} />
        )}
      </div>
    </div>
  );
};
