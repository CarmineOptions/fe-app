import { useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { useOptions } from "../../hooks/useOptions";
import { LoadingAnimation } from "../Loading/Loading";
import { TokenPairSelect } from "../TokenPairSelect";
import { PailConcentrated } from "./PailConcentrated";
import { PailNonConcentrated } from "./PailNonConcentrated";
import { AmmClammSwitch } from "./AmmClammSwitch";
import {
  useAccount,
  useProvider,
  useSendTransaction,
} from "@starknet-react/core";
import { Button, H6, P3, P4 } from "../common";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { useCurrency } from "../../hooks/useCurrency";
import { uniquePrimitiveValues } from "../../utils/utils";
import { PriceAt } from "./PriceAt";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";

export const Pail = () => {
  const { address } = useAccount();
  const { provider } = useProvider();
  const { sendAsync } = useSendTransaction({});
  const { isLoading, isError, options } = useOptions();
  const [pair, setPair] = useState<Pair>(Pair.pairByKey(PairKey.STRK_USDC));
  const [variant, setVariant] = useState<"amm" | "clamm">("amm");
  const [maturity, setMaturity] = useState<number | undefined>();
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");
  const [priceAt, setPriceAt] = useState<number>(0);
  const price = useCurrency(pair.baseToken.id);
  const { data: baseBalanceRaw } = useUserBalance(pair.baseToken.address);
  const { data: quoteBalanceRaw } = useUserBalance(pair.quoteToken.address);
  const baseBalance =
    baseBalanceRaw === undefined
      ? undefined
      : shortInteger(baseBalanceRaw, pair.baseToken.decimals);
  const quoteBalance =
    quoteBalanceRaw === undefined
      ? undefined
      : shortInteger(quoteBalanceRaw, pair.quoteToken.decimals);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

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

  return (
    <div className="flex flex-col gap-5 justify-between">
      <div className="w-fit">
        <TokenPairSelect pair={pair} setPair={setPair} />
      </div>
      <div className="w-fit">
        <AmmClammSwitch setVariant={setVariant} variant={variant} />
      </div>
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
      <H6>Size</H6>
      <input
        onChange={handleChange}
        type="text"
        placeholder="size"
        value={amountText}
        className="bg-dark-card border-dark-primary border-[0.5px] w-28 h-10 p-2"
      />
      <H6>Price at</H6>
      {price && priceRange && (
        <PriceAt
          pair={pair}
          price={priceAt}
          setPrice={setPriceAt}
          minPrice={priceRange[0]}
          maxPrice={priceRange[1]}
          tokenPrice={price}
        />
      )}
      {!maturity ? (
        <P3>Choose maturity</P3>
      ) : price === undefined ? (
        <div className="w-80">
          <LoadingAnimation />
        </div>
      ) : variant === "clamm" ? (
        <PailConcentrated
          pair={pair}
          address={address}
          baseBalance={baseBalance}
          quoteBalance={quoteBalance}
          provider={provider}
          sendAsync={sendAsync}
          size={amount}
          price={priceAt}
          maturity={maturity}
          tokenPrice={price}
        />
      ) : (
        <PailNonConcentrated
          pair={pair}
          address={address}
          baseBalance={baseBalance}
          quoteBalance={quoteBalance}
          provider={provider}
          sendAsync={sendAsync}
          size={amount}
          price={priceAt}
          maturity={maturity}
          tokenPrice={price}
        />
      )}
    </div>
  );
};
