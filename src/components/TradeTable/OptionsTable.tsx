import {
  openSidebar,
  setSidebarContent,
  setSidebarWidth,
} from "../../redux/actions";
import { OptionSidebar } from "../Sidebar";
import { P3, P4 } from "../common";
import { ReactNode } from "react";
import { SidebarWidth } from "../../redux/reducers/ui";
import {
  OptionSide,
  OptionWithPremia,
  TokenPair,
} from "@carmine-options/sdk/core";
import { useTokenPrice } from "../../hooks/usePrice";

type Props = {
  options: OptionWithPremia[];
  tokenPair: TokenPair;
  side: OptionSide | "all";
};

const OptionsTable = ({ options, tokenPair, side }: Props) => {
  const basePrice = useTokenPrice(options[0].base.symbol);
  const quotePrice = useTokenPrice(options[0].quote.symbol);

  const priceReady = basePrice !== undefined && quotePrice !== undefined;

  const handleOptionClick = (o: OptionWithPremia) => {
    setSidebarContent(<OptionSidebar option={o} />);
    setSidebarWidth(SidebarWidth.Base);
    openSidebar();
  };

  const filtered = options.filter(
    (o) => (side === "all" && o.optionSide === 0) || o.optionSide === side
  );

  const index =
    priceReady &&
    filtered.findIndex((o) => o.strikePrice.val > basePrice / quotePrice);

  const PriceSlip = () => (
    <div className="flex -my-4">
      <div className="w-24 border-dark-secondary border-b-[1px] mb-3" />
      <div className="h-5 px-4 g-3 content-center rounded-sm bg-dark-secondary text-dark-primary">
        <P4>
          {tokenPair.base.symbol}/{tokenPair.quote.symbol}{" "}
          {(basePrice! / quotePrice!).toFixed(3)}
        </P4>
      </div>
      <div className="w-24 grow border-dark-secondary border-b-[1px] mb-3" />
    </div>
  );

  const Square = ({
    className,
  }: {
    className: string;
    children?: ReactNode;
  }) => {
    return (
      <div
        className={`flex text-center items-center justify-center w-4 h-4 rounded-sm mb-1 text-dark-primary ${className}`}
      >
        +
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left">
        <div className="w-full">
          <P4 className="text-dark-secondary">strike</P4>
        </div>
        {(side === 0 || side === "all") && (
          <div className="w-full">
            <div className="flex gap-2 text-left">
              <P4 className="text-dark-secondary">ask price</P4>
              <P4 className="text-ui-successBg">/ long</P4>
            </div>
          </div>
        )}
        {(side === 1 || side === "all") && (
          <div className="w-full">
            <div className="flex gap-2 text-left">
              <P4 className="text-dark-secondary">bid price</P4>
              <P4 className="text-ui-errorBg">/ short</P4>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((o, i) => {
          const short = options.find(
            (other) =>
              other.optionSide === 1 &&
              other.strikePrice.val === o.strikePrice.val &&
              other.maturity === o.maturity
          );

          if (side === "all" && short === undefined) {
            return null;
          }

          const isBtc = o.base.symbol === "wBTC" || o.quote.symbol === "wBTC";

          return (
            <div key={i}>
              {priceReady && index !== false && index === i && <PriceSlip />}
              <div className="flex justify-between my-1 py-3">
                <div className="w-full">
                  <P3 className="font-semibold">
                    {tokenPair.quote.symbol === "USDC"
                      ? `$${o.strikePrice.val}`
                      : `${o.strikePrice.val} ${tokenPair.quote.symbol}`}
                  </P3>
                </div>
                {(side === 0 || side === "all") && (
                  <div
                    className="flex w-full gap-2 items-center text-left cursor-pointer text-ui-successBg"
                    onClick={() => handleOptionClick(o)}
                  >
                    <P3 className="font-semibold">
                      {o.premia.val.toFixed(3)} {o.underlying.symbol}{" "}
                      {isBtc && <span className="l2">size 0.1</span>}
                    </P3>
                    <Square className="bg-ui-successBg"></Square>
                  </div>
                )}
                {side === 1 && (
                  <div
                    className="flex w-full gap-2 items-center text-left cursor-pointer text-ui-errorBg"
                    onClick={() => handleOptionClick(o)}
                  >
                    <P3 className="font-semibold">
                      {o.premia.val.toFixed(3)} {o.underlying.symbol}{" "}
                      {isBtc && <span className="l2">size 0.1</span>}
                    </P3>
                    <Square className="bg-ui-errorBg"></Square>
                  </div>
                )}
                {side === "all" && (
                  <div
                    className="flex w-full gap-2 items-center text-left cursor-pointer text-ui-errorBg"
                    onClick={() => handleOptionClick(short!)}
                  >
                    <P3 className="font-semibold">
                      {short!.premia.val.toFixed(3)} {o.underlying.symbol}{" "}
                      {isBtc && <span className="l2">size 0.1</span>}
                    </P3>
                    <Square className="bg-ui-errorBg"></Square>
                  </div>
                )}
              </div>
              {priceReady && index === -1 && i === filtered.length - 1 && (
                <PriceSlip />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default OptionsTable;
