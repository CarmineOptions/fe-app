import { useEffect, useState } from "react";
import { Pair } from "../../classes/Pair";
import { Divider, H6 } from "../common";
import { BuyConcentrated } from "./BuyConcentrated";
import { Call, ProviderInterface } from "starknet";
import { RequestResult } from "@starknet-react/core";

type Props = {
  pair: Pair;
  size: number;
  price: number;
  address?: string;
  baseBalance?: number;
  quoteBalance?: number;
  maturity: number;
  provider: ProviderInterface;
  sendAsync: (
    args?: Call[]
  ) => Promise<RequestResult<"wallet_addInvokeTransaction">>;
  tokenPrice: number;
};

export const PailConcentrated = ({
  pair,
  size,
  price,
  address,
  baseBalance,
  quoteBalance,
  maturity,
  provider,
  sendAsync,
  tokenPrice,
}: Props) => {
  const [rangeLeft, setRangeLeft] = useState<number>(0.8 * tokenPrice);
  const [rangeRight, setRangeRight] = useState<number>(1.2 * tokenPrice);

  useEffect(() => {
    setRangeLeft(0.8 * tokenPrice);
    setRangeRight(1.2 * tokenPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair]);

  return (
    <div className="flex flex-col gap-5 justify-between">
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

      <BuyConcentrated
        tokenPair={pair}
        tokenPrice={tokenPrice}
        expiry={maturity}
        notional={size}
        priceAt={price}
        rangeLeft={rangeLeft}
        rangeRight={rangeRight}
        address={address}
        baseBalance={baseBalance}
        quoteBalance={quoteBalance}
        provider={provider}
        sendAsync={sendAsync}
      />
    </div>
  );
};
