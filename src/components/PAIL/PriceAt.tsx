import { ChangeEvent, CSSProperties, memo, useEffect, useState } from "react";
import { Pair } from "../../classes/Pair";

type Props = {
  pair: Pair;
  tokenPrice: number;
  price: number;
  minPrice: number;
  maxPrice: number;
  setPrice: (n: number) => void;
};

export const PriceAt = memo(
  ({ pair, setPrice, tokenPrice, minPrice, maxPrice }: Props) => {
    const [useCurrent, setUseCurrent] = useState(true);
    const [internalPrice, setInternalPrice] = useState<number>(tokenPrice);
    const [displayValue, setDisplayValue] = useState<string>(
      tokenPrice.toString()
    );

    useEffect(() => {
      setInternalPrice(tokenPrice);
      setDisplayValue(tokenPrice.toString());
      if (!useCurrent) {
        setPrice(tokenPrice);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pair]);

    const active = "bg-brand text-black";
    const nonActive = "bg-dark text-brand";
    const isValid = internalPrice >= minPrice && internalPrice <= maxPrice;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      inputValue = inputValue.replace(/^0{2,}/, "0"); // replace two leading 0 by one
      inputValue = inputValue.replace(/^0(?=[1-9])/, ""); // remove leading 0 if followed by number

      if (inputValue === "") {
        setDisplayValue("");
        setPrice(0);
        setInternalPrice(0);
        return;
      }

      const pattern = /^[0-9]+(?:[.,][0-9]*)?$/;

      if (!pattern.test(inputValue)) {
        return;
      }

      setDisplayValue(inputValue.replace(",", "."));
      const n = parseFloat(inputValue);
      setInternalPrice(n);
      setPrice(n);
    };

    return (
      <div>
        <div className="flex p-1 border-[1px] border-brand rounded-full w-fit">
          <button
            className={`w-36 p-2 rounded-l-full ${
              useCurrent ? active : nonActive
            }`}
            onClick={() => setUseCurrent(true)}
          >
            Use current price
          </button>
          <button
            className={`transition-[width]
 duration-300 ease-in-out p-2 rounded-r-full ${
   useCurrent ? nonActive + " w-36" : active + " w-80"
 }`}
            onClick={() => setUseCurrent(false)}
          >
            <div
              className={`flex items-center overflow-hidden ${
                useCurrent ? "justify-center" : "justify-around"
              }`}
            >
              <span>Specify&nbsp;price</span>
              {!useCurrent && (
                <span className="whitespace-nowrap">
                  {minPrice}
                  {" < "}
                  <input
                    onChange={handleChange}
                    type="text"
                    placeholder="price at"
                    value={displayValue}
                    style={
                      {
                        fieldSizing: "content",
                      } as CSSProperties
                    }
                    className={`bg-brand outline-none ${
                      isValid ? "text-black" : "text-ui-errorBg"
                    }`}
                  />
                  {" < "}
                  {maxPrice}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  }
);
