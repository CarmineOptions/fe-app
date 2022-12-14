import { CompositeOption, OptionSide, OptionType } from "../../types/options";
import { Box, Button, Paper, TableContainer, useTheme } from "@mui/material";
import { useState } from "react";
import { isFresh } from "../../utils/parseOption";
import OptionsTable from "./OptionsTable";
import { isDarkTheme } from "../../utils/utils";
import { LoadingAnimation } from "../loading";
import { NoContent } from "../TableNoContent";
import { fetchOptions } from "./fetchOptions";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { debug } from "../../utils/debugger";

const getText = (type: OptionType, side: OptionSide) =>
  `We currently do not have any ${
    side === OptionSide.Long ? "long" : "short"
  } ${type === OptionType.Call ? "call" : "put"} options.`;

type ContentProps = {
  options: CompositeOption[];
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
  const { isLoading, isError, data } = useQuery(QueryKeys.trade, fetchOptions);

  debug("React query data", { isLoading, isError, data });

  const [side, setLongShort] = useState<OptionSide>(OptionSide.Long);
  const [type, setCallPut] = useState<OptionType>(OptionType.Call);
  const theme = useTheme();

  const filtered = data
    ? data.filter(
        ({ raw, parsed }) =>
          isFresh(raw) &&
          parsed.optionSide === side &&
          parsed.optionType === type
      )
    : [];

  return (
    <Paper
      sx={{
        marginTop: 4,
        padding: 2,
        width: "100%",
        ...(isDarkTheme(theme) && {
          background: "#393946",
        }),
      }}
    >
      <Button
        variant={side === OptionSide.Long ? "contained" : "outlined"}
        onClick={() => setLongShort(OptionSide.Long)}
      >
        Long
      </Button>
      <Button
        variant={side === OptionSide.Long ? "outlined" : "contained"}
        onClick={() => setLongShort(OptionSide.Short)}
      >
        Short
      </Button>
      <Button
        variant={type === OptionType.Call ? "contained" : "outlined"}
        onClick={() => setCallPut(OptionType.Call)}
      >
        Call
      </Button>
      <Button
        variant={type === OptionType.Call ? "outlined" : "contained"}
        onClick={() => setCallPut(OptionType.Put)}
      >
        Put
      </Button>
      <TableContainer elevation={2} component={Paper}>
        <Content
          options={filtered}
          side={side}
          type={type}
          loading={isLoading}
          error={isError}
        />
      </TableContainer>
    </Paper>
  );
};

export default TradeTable;
