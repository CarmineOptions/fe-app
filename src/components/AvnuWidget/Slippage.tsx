import { useState } from "react";
import { Close } from "@mui/icons-material";

import styles from "./widget.module.css";

type Props = {
  setSlippage: (n: number) => void;
  close: () => void;
  currentSlippage: number;
};

const slipToText = (n: number) => n * 100 + "";

export const SlippageChange = ({
  close,
  setSlippage,
  currentSlippage,
}: Props) => {
  const [slippageText, setSlippageText] = useState<string>(
    slipToText(currentSlippage)
  );
  const slippages = [0.001, 0.005, 0.01];

  const handleInputChange = (value: string) => {
    if (value && value.length > 4) {
      return;
    }

    if (value.startsWith(".") || value.startsWith(",")) {
      setSlippageText("0" + value);
    } else {
      setSlippageText(value);
    }

    const float = parseFloat(value);
    setSlippage(float / 100);
  };

  return (
    <div className={styles.modalcontainer}>
      <div className={styles.modalheader}>
        <h3>Set slippage</h3>
        <div onClick={close}>
          <Close />
        </div>
      </div>
      <div className={styles.slippagecontainer}>
        <div className={styles.slippageinput}>
          <input
            type="number"
            min="0.01"
            max="1"
            value={slippageText}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{ border: "none" }}
          />
          <span>%</span>
        </div>
        <div className={styles.slippagelist}>
          {slippages.map((slip, i) => (
            <div
              onClick={() => {
                setSlippage(slip);
                setSlippageText(slipToText(slip));
              }}
              className={slip === currentSlippage ? styles.active : ""}
              key={i}
            >
              {slip * 100}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
