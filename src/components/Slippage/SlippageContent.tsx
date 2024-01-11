import { ButtonGroup, Typography } from "@mui/material";
import { useSlippage } from "../../hooks/useSlippage";
import { setSlippage } from "../../redux/actions";
import { ChangeEvent, useState } from "react";
import { CustomDialogTitle } from "../MultiDialog/MultiDialog";
import styles from "./slippage.module.css";
import inputStyles from "../../style/input.module.css";

export const SlippageContent = () => {
  const currentSlippage = useSlippage();
  const [inputText, setInputText] = useState<string>(String(currentSlippage));

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const valueIn = e.target.value.replace(",", ".");

    // smallest allowed number is 0.01
    // it is later converted to basis points
    // 0.01% -> 1 basis point
    if (!/^\d*\.{0,1}\d{0,2}$/.test(valueIn)) {
      return;
    }

    const parsed = parseFloat(valueIn);

    // max allowed number: 25
    if (parsed > 25) {
      return;
    }

    if (valueIn === ".") {
      setInputText("0.");
      setSlippage(0);
      return;
    }

    if (valueIn === "" || isNaN(parsed)) {
      setInputText("");
      setSlippage(0);
      return;
    }

    setInputText(valueIn);
    setSlippage(parsed);
  };

  const handleClick = (n: number) => {
    setSlippage(n);
    setInputText(String(n));
  };

  const title = `Slippage tolerance ${currentSlippage}%`;

  return (
    <>
      <CustomDialogTitle title={title} />
      <div className={styles.container}>
        <div>
          <input
            className={`${inputStyles.input} ${inputStyles.gold}`}
            type="text"
            value={inputText}
            onChange={handleChange}
          />
          <ButtonGroup
            sx={{ ml: 2 }}
            variant="contained"
            aria-label="outlined primary button group"
          >
            <button onClick={() => handleClick(1)}>1%</button>
            <button onClick={() => handleClick(5)}>5%</button>
            <button onClick={() => handleClick(10)}>10%</button>
          </ButtonGroup>
        </div>
        <div>
          {currentSlippage === 0 && (
            <Typography>Transaction may fail</Typography>
          )}
        </div>
      </div>
    </>
  );
};
