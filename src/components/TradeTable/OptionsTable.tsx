import { OptionWithPremia } from "../../classes/Option";
import { Pair } from "../../classes/Pair";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionSide } from "../../types/options";
import { openSidebar, setSidebarContent } from "../../redux/actions";
import { OptionSidebar } from "../Sidebar";
import { TokenKey } from "../../classes/Token";
import { P3, P4 } from "../common";
import { ReactNode } from "react";

type Props = {
  options: OptionWithPremia[];
  tokenPair: Pair;
  side: OptionSide | "all";
};

const OptionsTable = ({ options, tokenPair, side }: Props) => {
  const basePrice = useCurrency(tokenPair.baseToken.id);
  const quotePrice = useCurrency(tokenPair.quoteToken.id);

  const priceReady = basePrice !== undefined && quotePrice !== undefined;

  const handleOptionClick = (o: OptionWithPremia) => {
    setSidebarContent(<OptionSidebar option={o} />);
    openSidebar();
    o.sendViewEvent();
  };

  const filtered = options.filter(
    (o) => (side === "all" && o.side === OptionSide.Long) || o.side === side
  );

  const index =
    priceReady && filtered.findIndex((o) => o.strike > basePrice / quotePrice);

  const PriceSlip = () => (
    <div className="flex -my-4">
      <div className="w-24 border-dark-secondary border-b-[1px] mb-3" />
      <div className="h-5 px-4 g-3 content-center rounded-sm bg-dark-secondary text-dark-primary">
        <P4>
          {tokenPair.baseToken.symbol}/{tokenPair.quoteToken.symbol}{" "}
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
        {(side === OptionSide.Long || side === "all") && (
          <div className="w-full">
            <div className="flex gap-2 text-left">
              <P4 className="text-dark-secondary">ask price</P4>
              <P4 className="text-ui-successBg">/ long</P4>
            </div>
          </div>
        )}
        {(side === OptionSide.Short || side === "all") && (
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
              other.side === OptionSide.Short &&
              other.strike === o.strike &&
              other.maturity === o.maturity
          );

          if (side === "all" && short === undefined) {
            return null;
          }

          const isBtc =
            o.baseToken.id === TokenKey.BTC || o.quoteToken.id === TokenKey.BTC;

          return (
            <div key={i}>
              {priceReady && index !== false && index === i && <PriceSlip />}
              <div className="flex justify-between my-1 py-3">
                <div className="w-full">
                  <P3 className="font-semibold">
                    {tokenPair.quoteToken.id === TokenKey.USDC
                      ? `$${o.strike}`
                      : `${o.strike} ${tokenPair.quoteToken.symbol}`}
                  </P3>
                </div>
                {(side === OptionSide.Long || side === "all") && (
                  <div
                    className="flex w-full gap-2 items-center text-left cursor-pointer text-ui-successBg"
                    onClick={() => handleOptionClick(o)}
                  >
                    <P3 className="font-semibold">
                      {o.premia.toFixed(3)} {o.symbol}{" "}
                      {isBtc && <span className="l2">size 0.1</span>}
                    </P3>
                    <Square className="bg-ui-successBg"></Square>
                  </div>
                )}
                {side === OptionSide.Short && (
                  <div
                    className="flex w-full gap-2 items-center text-left cursor-pointer text-ui-errorBg"
                    onClick={() => handleOptionClick(o)}
                  >
                    <P3 className="font-semibold">
                      {o.premia.toFixed(3)} {o.symbol}{" "}
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
                      {short!.premia.toFixed(3)} {o.symbol}{" "}
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
