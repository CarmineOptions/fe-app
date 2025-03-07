import { Pair } from "../../classes/Pair";
import { Call, ProviderInterface } from "starknet";
import { RequestResult } from "@starknet-react/core";
import { BuyNonConcentrated } from "./BuyNonConcentrated";

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

export const PailNonConcentrated = ({
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
  return (
    <div className="flex flex-col gap-5 justify-between">
      <div className="h-8"></div>

      <BuyNonConcentrated
        tokenPair={pair}
        tokenPrice={tokenPrice}
        expiry={maturity}
        notional={size}
        priceAt={price}
        address={address}
        baseBalance={baseBalance}
        quoteBalance={quoteBalance}
        provider={provider}
        sendAsync={sendAsync}
      />
    </div>
  );
};
