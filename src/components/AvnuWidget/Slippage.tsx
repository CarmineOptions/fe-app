import { useState } from "react";
import { Close } from "@mui/icons-material";
import { H5 } from "../common";

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
    <div className="absolute top-0 left-0 right-0 bg-dark-container border-dark-primary border-2 rounded-md z-10 p-4">
      <div className="flex justify-between items-center">
        <H5>Set slippage</H5>
        <div onClick={close}>
          <Close />
        </div>
      </div>
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center border-dark-primary border-[1px]">
          <input
            type="number"
            min="0.01"
            max="1"
            className="bg-dark-container p-1"
            value={slippageText}
            onChange={(e) => handleInputChange(e.target.value)}
            style={{ border: "none" }}
          />
          <span className="mr-3">%</span>
        </div>
        <div className="flex gap-2">
          {slippages.map((slip, i) => (
            <div
              onClick={() => {
                setSlippage(slip);
                setSlippageText(slipToText(slip));
              }}
              className={
                slip === currentSlippage ? "text-brand" : "cursor-pointer"
              }
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
