import { P3, P4 } from ".";
import { Token } from "../../classes/Token";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionSide, OptionType } from "../../types/options";
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
  amount: number;
};

export const SideTypeStacked = ({ side, type }: SideType) => {
  return (
    <div>
      <P3
        className={`font-semibold ${
          side === OptionSide.Long ? "text-ui-successBg" : "text-ui-errorBg"
        }`}
      >
        {side === OptionSide.Long ? "LONG" : "SHORT"}
      </P3>
      <P4 className="text-dark-secondary">
        {type === OptionType.Call ? "CALL" : "PUT"}
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

export const MaturityStacked = ({ timestamp }: Maturity) => {
  const [date, time] = tsToDateTime(timestamp);
  return (
    <div>
      <P3 className="font-semibold">{date}</P3>
      <P4 className="text-dark-secondary">{time}</P4>
    </div>
  );
};

export const TokenValueStacked = ({ amount, token }: TokenValueProps) => {
  const price = useCurrency(token.id);

  return (
    <div>
      <P3 className="font-semibold">
        {price ? `$${formatNumber(price * amount)}` : "--"}
      </P3>
      <P4 className="text-dark-secondary">
        {formatNumber(amount)} {token.symbol}
      </P4>
    </div>
  );
};
