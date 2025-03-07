import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { Pair } from "../../classes/Pair";
import { Divider, H5, P3 } from "../common";
import { BuyConcentrated } from "./BuyConcentrated";
import { Call, ProviderInterface } from "starknet";
import { RequestResult } from "@starknet-react/core";
import { LoadingAnimation } from "../Loading/Loading";

type NumberInputProps = {
  value: number;
  setValue: (n: number) => void;
  placeholder: string;
};

export const NumberInput = ({
  value,
  setValue,
  placeholder,
}: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState(
    value.toString().replace(",", ".")
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/^0{2,}/, "0"); // replace two leading 0 by one
    inputValue = inputValue.replace(/^0(?=[1-9])/, ""); // remove leading 0 if followed by number

    if (inputValue === "") {
      setDisplayValue("");
      setValue(0);
      return;
    }

    const pattern = /^[0-9]+(?:[.,][0-9]*)?$/;

    if (!pattern.test(inputValue)) {
      return;
    }

    setDisplayValue(inputValue.replace(",", "."));
    const n = parseFloat(inputValue);
    setValue(n);
  };
  return (
    <div>
      <input
        onChange={handleChange}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        style={
          {
            fieldSizing: "content",
          } as CSSProperties
        }
        className="bg-dark-card border-dark-primary text-center border-[1px] min-w-32 h-10 py-2 px-4 rounded-full"
      />
    </div>
  );
};

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
      <div className="flex flex-col gap-2">
        <H5>Concentrated liquidity price range</H5>
        <P3>Choose range for the concentrated liquidity</P3>
        <div className="flex items-center gap-3">
          <NumberInput
            placeholder="Range left"
            setValue={setRangeLeft}
            value={rangeLeft}
          />
          <Divider className="w-10" />
          <NumberInput
            placeholder="Range right"
            setValue={setRangeRight}
            value={rangeRight}
          />
        </div>
      </div>
      <div className="h-8"></div>

      {rangeLeft !== undefined && rangeRight && rangeLeft < rangeRight ? (
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
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
};
