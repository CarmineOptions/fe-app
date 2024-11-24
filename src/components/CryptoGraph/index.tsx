import { Button, ButtonGroup, Paper } from "@mui/material";
import { useState } from "react";
import Graph from "./Graph";

const enum Dates {
  Day = 1,
  Week = 7,
  Month = 30,
}

const CryptoGraph = () => {
  const [days, setDays] = useState<Dates>(Dates.Day);
  return (
    <Paper
      elevation={1}
      sx={{
        width: "100%",
        height: "300px",
        background: "#F5F5F5",
      }}
    >
      <ButtonGroup size="small" aria-label="small button group">
        <Button
          variant={days === Dates.Day ? "contained" : undefined}
          onClick={() => setDays(Dates.Day)}
        >
          1D
        </Button>
        <Button
          variant={days === Dates.Week ? "contained" : undefined}
          onClick={() => setDays(Dates.Week)}
        >
          1W
        </Button>
        <Button
          variant={days === Dates.Month ? "contained" : undefined}
          onClick={() => setDays(Dates.Month)}
        >
          1M
        </Button>
      </ButtonGroup>
      <Graph days={days} />
    </Paper>
  );
};

export default CryptoGraph;
