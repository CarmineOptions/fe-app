import { OptionSide, OptionType } from "../../types/options";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import OptionsTable from "./OptionsTable";
import { isCall, isLong, uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { fetchOptions } from "./fetchOptions";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { Pair, PairKey } from "../../classes/Pair";
import { PairNamedBadge } from "../TokenBadge";
import { BtcToken, EthToken, StrkToken, UsdcToken } from "../../classes/Token";

import styles from "./tradetable.module.css";
import { InfoIcon } from "../InfoIcon";

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
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
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

  if (isError || !data) {
    return <div>Something went wrong</div>;
  }

  const maturities = data.map((o) => o.maturity).filter(uniquePrimitiveValues);

  if (maturity === undefined) {
    if (maturities.length) {
      setMaturity(maturities[0]);
    }
  }

  const filtered = data
    .filter(
      (option) =>
        (side === "all" ? true : option.isSide(side)) &&
        option.isType(type) &&
        option.isPair(pair) &&
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
      <Select
        value={pair}
        onChange={handleChange}
        sx={{
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          width: "285px",
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

      <div className={styles.buttons}>
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
        <InfoIcon text="TODO: explain Call Put" size="18px" />
        <div
          className="divider"
          style={{
            width: "50px",
            margin: "0 10px 0 0",
          }}
        />
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
        <InfoIcon text="TODO: explain Long Short" size="18px" />
        <div
          className="divider"
          style={{
            width: "50px",
            margin: "0 10px 0 0",
          }}
        />
        <span className={styles.maturity}>MATURITY</span>
        {maturities.map((m, i) => (
          <button
            onClick={() => setMaturity(m)}
            className={m === maturity ? "active secondary" : ""}
            key={i}
          >
            {formatTimestamp(m)}
          </button>
        ))}
        <InfoIcon text="TODO: explain maturity" size="18px" />
        <div
          className="divider"
          style={{
            width: "50px",
            margin: "0 10px 0 0",
          }}
        />
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
