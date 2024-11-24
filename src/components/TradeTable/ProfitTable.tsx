import { Tooltip } from "@mui/material";
import { OptionWithPremia } from "../../classes/Option";
import styles from "./profittable.module.css";

type ProfitTableTemplateProps = {
  limited: string;
  unlimited: string;
  breakEven: string;
  price: number;
  symbol: string;
  isLong: boolean;
};

const ProfitTableTemplate = ({
  limited,
  unlimited,
  breakEven,
  price,
  symbol,
  isLong,
}: ProfitTableTemplateProps) => (
  <div className={styles.container}>
    <div className={styles.row}>
      <span>Max Profit</span>
      <span>{isLong ? unlimited : limited}</span>
    </div>
    <div className={styles.row}>
      <span>Max Loss</span>
      <span>{!isLong ? unlimited : limited}</span>
    </div>
    <div className={styles.row}>
      <span>Break Even</span>
      <span>{breakEven}</span>
    </div>
    <div className={styles.row}>
      <span>Total in {symbol}</span>
      <Tooltip title={`${symbol} ${price}`}>
        <span>{price.toFixed(4)}</span>
      </Tooltip>
    </div>
  </div>
);

export const ProfitTableSkeleton = ({ symbol }: { symbol: string }) => (
  <ProfitTableTemplate
    limited="Calculating..."
    unlimited="Calculating..."
    breakEven="Calculating..."
    price={0}
    symbol={symbol}
    isLong={true}
  />
);

type ProfitTableProps = {
  option: OptionWithPremia;
  basePremia: number;
  price: number;
  premia: number;
};

export const ProfitTable = ({
  option,
  basePremia,
  price,
  premia,
}: ProfitTableProps) => {
  const limited = "$ " + premia.toFixed(2); // this is always in $
  const unlimited = "Unlimited";
  const breakEven =
    option.strikeCurrency +
    " " +
    (option.isCall
      ? option.strike + basePremia
      : option.strike - basePremia
    ).toFixed(2);

  return (
    <ProfitTableTemplate
      limited={limited}
      unlimited={unlimited}
      breakEven={breakEven}
      price={price}
      symbol={option.symbol}
      isLong={option.isLong}
    />
  );
};
