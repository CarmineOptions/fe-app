import { Tooltip } from "@mui/material";
import { P3 } from "../common";

type AmmVariants = "amm" | "clamm";

type Props = {
  variant: AmmVariants;
  setVariant: (v: AmmVariants) => void;
};

export const AmmClammSwitch = ({ variant, setVariant }: Props) => {
  const active = "bg-brand text-black";
  const nonActive = "bg-dark text-brand";

  return (
    <div className="flex items-center rounded-full border-[1px] border-brand p-1">
      <Tooltip title="Uniswap V2 AMM" arrow placement="top-start">
        <button
          className={`w-36 p-3 rounded-l-full ${
            variant === "amm" ? active : nonActive
          }`}
          onClick={() => setVariant("amm")}
        >
          <P3 className="font-bold">AMM</P3>
        </button>
      </Tooltip>
      <Tooltip
        title="Uniswap V3 Concentrated Liquidity AMM"
        arrow
        placement="top-end"
      >
        <button
          className={`w-36 p-3 rounded-r-full ${
            variant === "clamm" ? active : nonActive
          }`}
          onClick={() => setVariant("clamm")}
        >
          <P3 className="font-bold">CLAMM</P3>
        </button>
      </Tooltip>
    </div>
  );
};
