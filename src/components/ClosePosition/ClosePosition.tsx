import { Box, Typography } from "@mui/material";
import { ReactNode, useState } from "react";
import { useCloseOption } from "../../hooks/useCloseOption";
import { usePremiaQuery } from "../../hooks/usePremiaQuery";
import { debug } from "../../utils/debugger";
import { CustomDialogTitle } from "../MultiDialog/MultiDialog";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useDebounce } from "../../hooks/useDebounce";
import { math64x61toDecimal, math64x61ToInt } from "../../utils/units";
import { getPremiaWithSlippage, shortInteger } from "../../utils/computations";
import { tradeClose } from "../../calls/tradeClose";
import { useAccount } from "../../hooks/useAccount";
import { store } from "../../redux/store";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionWithPosition } from "../../classes/Option";
import buttonStyles from "../../style/button.module.css";
import inputStyles from "../../style/input.module.css";

const premiaToDisplayValue = (
  premia: number,
  base: number,
  quote: number,
  option: OptionWithPosition
) => {
  // Long Call
  if (option.isCall && option.isLong) {
    return `$${(premia * base).toFixed(2)}`;
  }
  // Long Put
  if (option.isPut && option.isLong) {
    return `$${(premia * quote).toFixed(2)}`;
  }
  // Short Call
  if (option.isCall && option.isShort) {
    return `$${((option.size * quote - premia) * base).toFixed(2)}`;
  }
  // Short Put
  if (option.isPut && option.isShort) {
    return `$${((option.size * base - premia) * quote).toFixed(2)}`;
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
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          className={inputStyles.input}
          style={{ margin: "16px", minWidth: "200px" }}
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
    </>
  );
};

type Props = {
  option: OptionWithPosition;
};

const WithOption = ({ option }: Props) => {
  const account = useAccount();
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

  const premiaNumber = math64x61toDecimal(premiaMath64);

  debug({ premiaMath64, premiaNumber });

  const premiaWithSlippage = shortInteger(
    getPremiaWithSlippage(
      BigInt(math64x61ToInt(premiaMath64, option.digits)),
      side,
      true
    ).toString(10),
    option.digits
  );

  const slippage = store.getState().settings.slippage;

  const displayPremia = premiaToDisplayValue(premiaNumber, base, quote, option);
  const displayPremiaWithSlippage = premiaToDisplayValue(
    premiaWithSlippage,
    base,
    quote,
    option
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
            <Typography sx={{ fontSize: "1.2rem" }}>{displayPremia}</Typography>
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
              {displayPremiaWithSlippage}
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

  const title = `$${option.strike} ${option.typeAsText}`;

  return (
    <>
      <CustomDialogTitle title={title} />
      <WithOption option={option} />
    </>
  );
};
