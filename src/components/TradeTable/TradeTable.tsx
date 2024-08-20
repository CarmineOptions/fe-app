import { OptionSide, OptionType } from "../../types/options";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import OptionsTable from "./OptionsTable";
import { isCall, isLong, uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { fetchOptionsWithType } from "./fetchOptions";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { OptionWithPremia } from "../../classes/Option";
import { PairKey } from "../../classes/Pair";
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

type ContentProps = {
  options: OptionWithPremia[];
  type: OptionType;
  side: OptionSide | "all";
  loading: boolean;
  error: boolean;
};

const Content = ({ options, type, side, loading, error }: ContentProps) => {
  if (loading)
    return (
      <div>
        <LoadingAnimation size={40} />
      </div>
    );

  if (error) return <NoContent text="Option not available at the moment" />;

  return (
    <>
      {options.length === 0 ? (
        <NoContent text={getText(type, side)} />
      ) : (
        <OptionsTable options={options} />
      )}
    </>
  );
};

export const TradeTable = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.optionsWithType,
    fetchOptionsWithType
  );
  const [side, setSide] = useState<OptionSide.Long | OptionSide.Short | "all">(
    "all"
  );
  const [maturity, setMaturity] = useState<number | undefined>();
  const [type, setCallPut] = useState<OptionType>(
    data ? data[1] : OptionType.Call
  );
  const [typeSet, setTypeSet] = useState(false);
  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <div>Something went wrong</div>;
  }

  if (!typeSet && data && data[1]) {
    setCallPut(data[1]);
    setTypeSet(true);
  }

  const maturities = data[0]
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues);

  if (maturity === undefined) {
    if (maturities.length) {
      setMaturity(maturities[0]);
    }
  }

  const filtered = data[0].filter(
    (option) =>
      (side === "all" ? true : option.isSide(side)) &&
      option.isType(type) &&
      option.isPair(pair) &&
      option.maturity === maturity
  );

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
        <Content
          options={filtered}
          side={OptionSide.Long}
          type={type}
          loading={isLoading}
          error={isError}
        />
      </div>
    </div>
  );
};
