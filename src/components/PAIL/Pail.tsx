import { ChangeEvent, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { useOptions } from "../../hooks/useOptions";
import { uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";
import { Buy } from "./Buy";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { longInteger } from "../../utils/computations";
import { Owned } from "./Owned";
import { TokenPairSelect } from "../TokenPairSelect";
import { Button, Divider, H6, P3, P4 } from "../common";

export const Pail = () => {
  const { isLoading, isError, options } = useOptions();
  const [pair, setPair] = useState<Pair>(Pair.pairByKey(PairKey.STRK_USDC));
  const [maturity, setMaturity] = useState<number | undefined>();
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");

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

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

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
      <div className="w-fit">
        <TokenPairSelect pair={pair} setPair={setPair} />
      </div>
      <Divider />
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
        <div className="flex flex-col gap-1">
          <H6>Price at</H6>
          <P3>Price at which you want to protect against impermanent loss.</P3>
          <P3>
            If you check current, price at the time of execution will be used.
          </P3>
          {!!priceRange && (
            <H6>
              Price range: {priceRange[0]} - {priceRange[1]}
            </H6>
          )}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={priceAtCurrent}
            onChange={() => setPriceAtCurrent((prev) => !prev)}
          />
          <input
            onChange={handlePriceAtChange}
            type="number"
            placeholder="price at"
            value={priceAt}
            className={`bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2${
              priceRange && (priceAt < priceRange[0] || priceAt > priceRange[1])
                ? " border-ui-errorBg border-[2px]"
                : ""
            }`}
          />
        </div>
      </div>

      {!!pair &&
        !!maturity &&
        (priceAtCurrent || isPriceWithinRange ? (
          <Buy
            tokenPair={pair}
            expiry={maturity}
            notional={longInteger(amount, pair.baseToken.decimals)}
            priceAt={priceAtCurrent ? 0 : priceAt}
          />
        ) : (
          <P3>Either check current price or use price withing range</P3>
        ))}
      <div className={"divider"} />
      <Owned />
    </div>
  );
};
