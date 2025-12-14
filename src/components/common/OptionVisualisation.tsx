import {
  OptionSide,
  OptionSideLong,
  OptionType,
  OptionTypeCall,
  Token,
} from "carmine-sdk/core";
import { P3, P4 } from ".";
import { useTokenPrice } from "../../hooks/usePrice";
import { formatNumber } from "../../utils/utils";

type SideType = {
  side: OptionSide;
  type: OptionType;
};

type Maturity = {
  timestamp: number;
};

type TokenValueProps = {
  token: Token;
  amount: number | undefined;
};

export const SideTypeStacked = ({ side, type }: SideType) => {
  return (
    <div>
      <P3
        className={`font-semibold ${
          side === OptionSideLong ? "text-ui-successBg" : "text-ui-errorBg"
        }`}
      >
        {side === OptionSideLong ? "LONG" : "SHORT"}
      </P3>
      <P4 className="text-dark-secondary">
        {type === OptionTypeCall ? "CALL" : "PUT"}
      </P4>
    </div>
  );
};

const tsToDateTime = (timestamp: number): [string, string] => {
  const dateObj = new Date(timestamp * 1000);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const dateString = dateObj.toLocaleDateString("en-US", dateOptions);
  const timeString = dateObj
    .toLocaleTimeString("en-US", timeOptions)
    .replace(/\s/g, "");

  return [dateString, timeString];
};

type MajorMinorStackedProps = {
  major: string;
  minor: string;
};

export const MajorMinorStacked = ({ major, minor }: MajorMinorStackedProps) => {
  return (
    <div>
      <P3 className="font-semibold text-dark-primary">{major}</P3>
      <P4 className="text-dark-secondary">{minor}</P4>
    </div>
  );
};

export const MaturityStacked = ({ timestamp }: Maturity) => {
  const [date, time] = tsToDateTime(timestamp);
  return <MajorMinorStacked major={date} minor={time} />;
};

export const TokenValueStacked = ({ amount, token }: TokenValueProps) => {
  const price = useTokenPrice(token.symbol);

  return (
    <MajorMinorStacked
      major={
        price !== undefined && amount !== undefined
          ? `$${formatNumber(price * amount)}`
          : "--"
      }
      minor={
        amount !== undefined ? `${formatNumber(amount)} ${token.symbol}` : "--"
      }
    />
  );
};
