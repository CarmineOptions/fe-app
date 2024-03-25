import { OptionSide, OptionType } from "../../types/options";
import { Box, TableContainer } from "@mui/material";
import { useState } from "react";
import OptionsTable from "./OptionsTable";
import { isCall, isLong } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { fetchOptionsWithType } from "./fetchOptions";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { OptionWithPremia } from "../../classes/Option";
import { PairKey } from "../../classes/Pair";
import styles from "../../style/button.module.css";

const getText = (type: OptionType, side: OptionSide) =>
  `We currently do not have any ${isLong(side) ? "long" : "short"} ${
    isCall(type) ? "call" : "put"
  } options.`;

type ContentProps = {
  options: OptionWithPremia[];
  type: OptionType;
  side: OptionSide;
  loading: boolean;
  error: boolean;
};

const Content = ({ options, type, side, loading, error }: ContentProps) => {
  if (loading)
    return (
      <Box sx={{ padding: "20px" }}>
        <LoadingAnimation size={40} />
      </Box>
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

const TradeTable = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.optionsWithType,
    fetchOptionsWithType
  );
  const [side, setLongShort] = useState<OptionSide>(OptionSide.Long);
  const [type, setCallPut] = useState<OptionType>(
    data ? data[1] : OptionType.Call
  );
  const [typeSet, setTypeSet] = useState(false);

  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);

  if (!typeSet && data && data[1]) {
    setCallPut(data[1]);
    setTypeSet(true);
  }

  const filtered = data
    ? data[0].filter(
        (option) =>
          option.isFresh &&
          option.isSide(side) &&
          option.isType(type) &&
          option.isPair(pair)
      )
    : [];

  const shownPairs = [
    PairKey.STRK_USDC,
    PairKey.ETH_STRK,
    PairKey.ETH_USDC,
    PairKey.BTC_USDC,
  ];

  return (
    <>
      <div
        style={{
          visibility: data ? undefined : "hidden",
          display: "flex",
          flexFlow: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div className={styles.container}>
          {shownPairs.map((currentPair, i) => (
            <button
              key={i}
              className={pair === currentPair ? styles.active : "non-active"}
              onClick={() => setPair(currentPair)}
            >
              {currentPair}
            </button>
          ))}
        </div>
        <div
          className={`${styles.container} ${styles.twos}`}
          style={{ marginLeft: "auto" }}
        >
          <button
            className={isLong(side) ? styles.active : "non-active"}
            onClick={() => setLongShort(OptionSide.Long)}
          >
            Long
          </button>
          <button
            className={isLong(side) ? "non-active" : styles.active}
            onClick={() => setLongShort(OptionSide.Short)}
          >
            Short
          </button>
          <button
            className={isCall(type) ? styles.active : "non-active"}
            onClick={() => setCallPut(OptionType.Call)}
          >
            Call
          </button>
          <button
            className={isCall(type) ? "non-active" : styles.active}
            onClick={() => setCallPut(OptionType.Put)}
          >
            Put
          </button>
        </div>
      </div>
      <TableContainer component={Box}>
        <Content
          options={filtered}
          side={side}
          type={type}
          loading={isLoading}
          error={isError}
        />
      </TableContainer>
    </>
  );
};

export default TradeTable;
