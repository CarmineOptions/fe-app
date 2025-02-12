import { ChangeEvent, useState } from "react";
import { Pair } from "../../classes/Pair";
import { uniquePrimitiveValues } from "../../utils/utils";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { Owned } from "./Owned";
import { Button, Divider, H6, P3, P4 } from "../common";
import { useCurrency } from "../../hooks/useCurrency";
import { OptionWithPremia } from "../../classes/Option";
import { BuyConcentrated } from "./BuyConcentrated";

type Props = {
  options: OptionWithPremia[];
  pair: Pair;
};

export const PailConcentrated = ({ options, pair }: Props) => {
  const [maturity, setMaturity] = useState<number | undefined>();
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");

  const [rangeLeft, setRangeLeft] = useState<number>(0);
  const [rangeRight, setRangeRight] = useState<number>(0);

  const price = useCurrency(pair.baseToken.id);

  const [priceAt, setPriceAt] = useState<number>(0);
  const [priceAtCurrent, setPriceAtCurrent] = useState<boolean>(true);

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  const handlePriceAtChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const parsed = parseFloat(e?.target?.value);
      setPriceAt(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  const thisPairOptions = options.filter((option) =>
    option.isPair(pair.pairId)
  );

  const maturities = thisPairOptions
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues);

  if (maturity === undefined || !maturities.includes(maturity)) {
    if (maturities.length) {
      setMaturity(maturities[0]);
    }
  }

  const longsWithMaturity = thisPairOptions.filter(
    (option) => option.isLong && option.maturity === maturity
  );

  const calls = longsWithMaturity
    .filter((option) => option.isCall)
    .sort((a, b) => a.strike - b.strike);

  const puts = longsWithMaturity
    .filter((option) => option.isPut)
    .sort((a, b) => a.strike - b.strike);

  const maxCall = calls.at(-1);
  const minPut = puts.at(0);

  const priceRange =
    !!maxCall && !!minPut ? [minPut.strike, maxCall.strike] : undefined;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const isPriceWithinRange =
    priceRange && priceAt >= priceRange[0] && priceAt <= priceRange[1];

  return (
    <div className="flex flex-col gap-5 justify-between">
      <div className="flex gap-2 items-center">
        <P4 className="text-dark-secondary font-semibold">MATURITY</P4>
        {maturities
          .sort((a, b) => a - b)
          .map((m, i) => (
            <Button
              type="secondary"
              outlined={m !== maturity}
              onClick={() => setMaturity(m)}
              key={i}
            >
              {formatTimestamp(m)}
            </Button>
          ))}
      </div>
      <div>
        <div>
          <h3>Size</h3>
        </div>
        <div>
          <input
            onChange={handleChange}
            type="text"
            placeholder="size"
            value={amountText}
            className="bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2"
          />
        </div>
      </div>
      <div>
        <H6>Concentrated liquidity AMM price range</H6>
        <div className="flex items-center gap-3">
          <input
            onChange={(e) => setRangeLeft(Number(e.target.value))}
            value={rangeLeft}
            type="number"
            placeholder="range left"
            className={`bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2`}
          />
          <Divider className="w-10" />
          <input
            onChange={(e) => setRangeRight(Number(e.target.value))}
            value={rangeRight}
            type="number"
            placeholder="range right"
            className={`bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <H6>Price at</H6>
        <div>
          <P3>Price at which you want to protect against impermanent loss.</P3>
          <P3>
            If you check current, price at the time of execution will be used.
          </P3>
        </div>
        <div className="p-1 flex items-center gap-2">
          <Button
            type="secondary"
            outlined={!priceAtCurrent}
            onClick={() => setPriceAtCurrent(true)}
          >
            Current Price
          </Button>
          <Divider className="w-10" />
          <Button
            type="secondary"
            outlined={priceAtCurrent}
            onClick={() => setPriceAtCurrent(false)}
          >
            Choose Price
          </Button>
        </div>
        <div
          className={`overflow-hidden transition-height ${
            priceAtCurrent ? "max-h-0" : "max-h-10"
          }`}
          style={{ transition: "max-height 0.3s ease-in-out" }}
        >
          <div className="flex items-center gap-5">
            {!!priceRange && (
              <P3>
                Price range: {priceRange[0]} - {priceRange[1]}
              </P3>
            )}
            <input
              onChange={handlePriceAtChange}
              type="number"
              placeholder="price at"
              disabled={priceAtCurrent}
              value={priceAt}
              className={`bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2${
                priceAtCurrent
                  ? " border-ui-neutralBg text-ui-neutralBg"
                  : priceRange &&
                    (priceAt < priceRange[0] || priceAt > priceRange[1])
                  ? " border-ui-errorBg border-[2px]"
                  : ""
              }`}
            />
          </div>
        </div>
      </div>
      {!!pair &&
        !!maturity &&
        (!priceAtCurrent || price !== undefined) && // either price is set or current price is fetched
        (priceAtCurrent || isPriceWithinRange ? (
          <BuyConcentrated
            tokenPair={pair}
            expiry={maturity}
            notional={amount}
            priceAt={priceAtCurrent ? price! : priceAt}
            rangeLeft={rangeLeft}
            rangeRight={rangeRight}
          />
        ) : (
          <P3>Either check current price or use price withing range</P3>
        ))}
      <Divider className="my-8" />
      <Owned />
    </div>
  );
};
