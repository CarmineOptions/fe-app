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
import buttonStyles from "../../style/button.module.css";
import styles from "./index.module.css";
import { StarknetIcon } from "../Icons";

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
  const [type, setCallPut] = useState<OptionType>(OptionType.Call);
  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);

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
        className={styles.container}
        style={{
          visibility: data ? undefined : "hidden",
        }}
      >
        <div className={buttonStyles.container}>
          {shownPairs.map((currentPair, i) => (
            <button
              key={i}
              className={
                pair === currentPair ? buttonStyles.active : "non-active"
              }
              onClick={() => setPair(currentPair)}
            >
              {currentPair}
            </button>
          ))}
        </div>
        <div className={buttonStyles.container}>
          <button
            className={isLong(side) ? buttonStyles.active : "non-active"}
            onClick={() => setLongShort(OptionSide.Long)}
          >
            Long
          </button>
          <button
            className={isLong(side) ? "non-active" : buttonStyles.active}
            onClick={() => setLongShort(OptionSide.Short)}
          >
            Short{" "}
            <StarknetIcon
              style={{ width: "22px", height: "22px", marginLeft: "5px" }}
            />
          </button>
          <button
            className={isCall(type) ? buttonStyles.active : "non-active"}
            onClick={() => setCallPut(OptionType.Call)}
          >
            Call
          </button>
          <button
            className={isCall(type) ? "non-active" : buttonStyles.active}
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
