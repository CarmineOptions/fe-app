import { ReactNode, useState } from "react";
import {
  useAccount,
  useProvider,
  useSendTransaction,
} from "@starknet-react/core";

import { Pair, PairKey } from "../../classes/Pair";
import { useOptions } from "../../hooks/useOptions";
import { LoadingAnimation } from "../Loading/Loading";
import { TokenPairSelect } from "../TokenPairSelect";
import { PailConcentrated } from "./PailConcentrated";
import { PailNonConcentrated } from "./PailNonConcentrated";
import { AmmClammSwitch } from "./AmmClammSwitch";
import { Button, H5, P3, P4 } from "../common";
import { useCurrency } from "../../hooks/useCurrency";
import { uniquePrimitiveValues } from "../../utils/utils";
import { PriceAt } from "./PriceAt";
import { useUserBalance } from "../../hooks/useUserBalance";
import { shortInteger } from "../../utils/computations";
import { SizeInput } from "./SizeInput";

type ItemProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

const Item = ({ title, description, children }: ItemProps) => (
  <div className="flex flex-col gap-2">
    {title && <H5>{title}</H5>}
    {description && <P3>{description}</P3>}
    {children}
  </div>
);

export const Pail = () => {
  const { address } = useAccount();
  const { provider } = useProvider();
  const { sendAsync } = useSendTransaction({});
  const { isLoading, isError, options } = useOptions();
  const [pair, setPair] = useState<Pair>(Pair.pairByKey(PairKey.STRK_USDC));
  const [variant, setVariant] = useState<"amm" | "clamm">("amm");
  const [maturity, setMaturity] = useState<number | undefined>();
  const [amount, setAmount] = useState<number>(1);
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
      <Item
        title="Pool Type"
        description="Choose between Uniswap V2 AMM or Uniswap V3 Concentrated Liquidity
          AMM."
      >
        <div className="w-fit">
          <AmmClammSwitch setVariant={setVariant} variant={variant} />
        </div>
      </Item>
      <Item
        title="Token Pair"
        description="Select token pair that you want to protect."
      >
        <div className="w-fit">
          <TokenPairSelect pair={pair} setPair={setPair} />
        </div>
      </Item>
      <Item
        title="Maturity"
        description="Choose when the protection will mature."
      >
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
      </Item>
      <Item
        title="Size"
        description={`Choose size to protect. Size is denominated in the base token (${pair.baseToken.symbol}).`}
      >
        <SizeInput size={amount} setSize={setAmount} />
      </Item>

      <Item
        title="Price At"
        description="Choose which price to protect at. Either choose specific price or use the current price."
      >
        {price && priceRange ? (
          <PriceAt
            pair={pair}
            price={priceAt}
            setPrice={setPriceAt}
            minPrice={priceRange[0]}
            maxPrice={priceRange[1]}
            tokenPrice={price}
          />
        ) : (
          <LoadingAnimation />
        )}
      </Item>
      {!maturity ? (
        <P3>Choose maturity</P3>
      ) : !amount ? (
        <P3>Choose size</P3>
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
