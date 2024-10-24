import { Box, Typography } from "@mui/material";
import { ReactNode, useState } from "react";
import { useCloseOption } from "../../hooks/useCloseOption";
import { usePremiaQuery } from "../../hooks/usePremiaQuery";
import { debug } from "../../utils/debugger";
import { CustomDialogTitle } from "../MultiDialog/MultiDialog";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useDebounce } from "../../hooks/useDebounce";
import { math64toDecimal, math64ToInt } from "../../utils/units";
import { getPremiaWithSlippage, shortInteger } from "../../utils/computations";
import { tradeClose } from "../../calls/tradeClose";
import { store } from "../../redux/store";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionWithPosition } from "../../classes/Option";
import buttonStyles from "../../style/button.module.css";
import { formatNumber } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const premiaToDisplayValue = (
  premia: number,
  base: number,
  quote: number,
  option: OptionWithPosition
) => {
  // Long Call
  if (option.isCall && option.isLong) {
    return `${(premia * base).toFixed(2)}`;
  }
  // Long Put
  if (option.isPut && option.isLong) {
    return `${(premia * quote).toFixed(2)}`;
  }
  // Short Call
  if (option.isCall && option.isShort) {
    return `${((option.size * quote - premia) * base).toFixed(2)}`;
  }
  // Short Put
  if (option.isPut && option.isShort) {
    return `${((option.size * base - premia) * quote).toFixed(2)}`;
  }
  // unreachable
  throw Error('Could not get "premiaToDisplayValue"');
};

type TemplateProps = {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleClick: (n: number) => void;
  inputText: string;
  max: number;
  children: ReactNode;
};

const Template = ({
  handleChange,
  handleClick,
  inputText,
  max,
  children,
}: TemplateProps) => {
  return (
    <div style={{ padding: "0 16px 16px 16px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          style={{
            marginRight: "8px",
            minWidth: "200px",
          }}
          type="text"
          value={inputText}
          onChange={handleChange}
        />
        <button
          className={buttonStyles.secondary}
          onClick={() => handleClick(max)}
        >
          Max
        </button>
      </Box>
      {children}
    </div>
  );
};

type Props = {
  option: OptionWithPosition;
};

const WithOption = ({ option }: Props) => {
  const { account } = useAccount();
  const base = useCurrency(option.baseToken.id);
  const quote = useCurrency(option.quoteToken.id);

  const { size: max, side } = option;
  const [size, setSize] = useState<number>(max);
  const [inputText, setInputText] = useState<string>(String(max));
  const debouncedSize = useDebounce<number>(size);

  const {
    data: premiaMath64,
    error,
    isFetching,
  } = usePremiaQuery(option, size, true);

  const cb = (n: number) => (n > max ? max : n);
  const handleChange = handleNumericChangeFactory(setInputText, setSize, cb);
  const handleClick = (n: number) => {
    setSize(n);
    setInputText(String(n));
  };

  const close = (premia: bigint) => {
    if (!account || !size) {
      debug("Could not trade close", {
        account,
        option,
        size,
      });
      return;
    }

    tradeClose(account, option, premia, size, true);
  };

  if (debouncedSize === 0) {
    return (
      <Template
        handleChange={handleChange}
        handleClick={handleClick}
        inputText={inputText}
        max={max}
      >
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
          }}
        >
          <Box
            sx={{
              my: 3,
            }}
          >
            <Box>
              <Typography>Cannot close size 0</Typography>
            </Box>
          </Box>
          <button disabled>Close selected</button>
        </Box>
      </Template>
    );
  }

  if (isFetching || !base || !quote) {
    // loading...
    return (
      <Template
        handleChange={handleChange}
        handleClick={handleClick}
        inputText={inputText}
        max={max}
      >
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
          }}
        >
          <Box
            sx={{
              my: 3,
            }}
          >
            <Box>
              <Typography>Loading...</Typography>
            </Box>
          </Box>
          <button disabled>Loading...</button>
        </Box>
      </Template>
    );
  }

  if (typeof premiaMath64 === "undefined" || error) {
    // no data
    return (
      <Template
        handleChange={handleChange}
        handleClick={handleClick}
        inputText={inputText}
        max={max}
      >
        <div>Did not receive any data</div>
      </Template>
    );
  }

  const premiaNumber = math64toDecimal(premiaMath64);

  debug({ premiaMath64, premiaNumber });

  const premiaWithSlippage = shortInteger(
    getPremiaWithSlippage(
      BigInt(math64ToInt(premiaMath64, option.digits)),
      side,
      true
    ).toString(10),
    option.digits
  );

  const slippage = store.getState().settings.slippage;

  const displayPremia = formatNumber(
    option.isShort ? size - premiaNumber : premiaNumber
  );
  const displayPremiaWithSlippage = formatNumber(
    option.isShort ? size - premiaWithSlippage : premiaWithSlippage
  );

  return (
    <Template
      handleChange={handleChange}
      handleClick={handleClick}
      inputText={inputText}
      max={max}
    >
      <Box
        sx={{
          display: "flex",
          flexFlow: "column",
        }}
      >
        <Box
          sx={{
            my: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexFlow: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: "1.2rem" }}>Total Received</Typography>
            <Typography sx={{ fontSize: "1.2rem" }}>
              {displayPremia} {option.underlying.symbol}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexFlow: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: "1rem" }} variant="caption">
              Slippage {slippage}% limit
            </Typography>
            <Typography sx={{ fontSize: "1rem" }} variant="caption">
              {displayPremiaWithSlippage} {option.underlying.symbol}
            </Typography>
          </Box>
        </Box>
        <button
          className={buttonStyles.green}
          onClick={() => close(premiaMath64)}
        >
          Close selected
        </button>
      </Box>
    </Template>
  );
};

export const ClosePosition = () => {
  const option = useCloseOption();

  if (!option) {
    return (
      <>
        <CustomDialogTitle title="Close Position" />
        Something went wrong
      </>
    );
  }

  const title = `${option.strikeCurrency} ${option.strike} ${option.typeAsText}`;

  return (
    <>
      <CustomDialogTitle title={title} />
      <WithOption option={option} />
    </>
  );
};
