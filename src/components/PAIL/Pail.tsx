import { useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import {
  StrkToken,
  UsdcToken,
  EthToken,
  EkuboToken,
  BtcToken,
} from "../../classes/Token";
import { PairNamedBadge } from "../TokenBadge";
import { useOptions } from "../../hooks/useOptions";
import { uniquePrimitiveValues } from "../../utils/utils";
import { LoadingAnimation } from "../Loading/Loading";

import styles from "./styles.module.css";
import { Buy } from "./Buy";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { longInteger } from "../../utils/computations";
import { Owned } from "./Owned";

export const Pail = () => {
  const { isLoading, isError, options } = useOptions();
  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);
  const [maturity, setMaturity] = useState<number | undefined>();
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");
  const tokenPair = Pair.pairByKey(pair);

  const [priceAt, setPriceAt] = useState<number>(0);
  const [priceAtCurrent, setPriceAtCurrent] = useState<boolean>(true);

  const handlePairChange = (event: SelectChangeEvent) => {
    setPair(event.target.value as PairKey);
  };

  const handleChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  const handlePriceAtChange = (e: any) => {
    try {
      const parsed = parseFloat(e?.target?.value);
      setPriceAt(parsed);
    } catch {}
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

  const thisPairOptions = options.filter((option) => option.isPair(pair));

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
    <div className={styles.container}>
      <div>
        <Select
          value={pair}
          onChange={handlePairChange}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              { padding: 0 },
            width: "288px",
          }}
        >
          <MenuItem value={PairKey.STRK_USDC}>
            <PairNamedBadge tokenA={StrkToken} tokenB={UsdcToken} />
          </MenuItem>
          <MenuItem value={PairKey.ETH_USDC}>
            <PairNamedBadge tokenA={EthToken} tokenB={UsdcToken} />
          </MenuItem>
          <MenuItem value={PairKey.ETH_STRK}>
            <PairNamedBadge tokenA={EthToken} tokenB={StrkToken} />
          </MenuItem>
          <MenuItem value={PairKey.EKUBO_USDC}>
            <PairNamedBadge tokenA={EkuboToken} tokenB={UsdcToken} />
          </MenuItem>
          <MenuItem value={PairKey.BTC_USDC}>
            <PairNamedBadge tokenA={BtcToken} tokenB={UsdcToken} />
          </MenuItem>
        </Select>
      </div>
      <div className={"divider"} />
      <div className={styles.maturitybuttons}>
        <span className={styles.maturity}>MATURITY</span>
        {maturities
          .sort((a, b) => a - b)
          .map((m, i) => (
            <button
              onClick={() => setMaturity(m)}
              className={m === maturity ? "active secondary" : ""}
              key={i}
            >
              {formatTimestamp(m)}
            </button>
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
          />
        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            flexFlow: "column",
            gap: "5px",
          }}
        >
          <h3>Price at</h3>
          <p>Price at which you want to protect against impermanent loss.</p>
          <p>
            If you check current, price at the time of execution will be used.
          </p>
          {!!priceRange && (
            <h4>
              Price range: {priceRange[0]} - {priceRange[1]}
            </h4>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
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
            style={{
              border:
                priceRange &&
                (priceAt < priceRange[0] || priceAt > priceRange[1])
                  ? "2px solid red"
                  : "",
            }}
          />
        </div>
      </div>

      {!!tokenPair &&
        !!maturity &&
        (priceAtCurrent || isPriceWithinRange ? (
          <Buy
            tokenPair={Pair.pairByKey(pair)}
            expiry={maturity}
            notional={longInteger(amount, tokenPair.baseToken.decimals)}
            priceAt={priceAtCurrent ? 0 : priceAt}
          />
        ) : (
          <p>Either check current price or use price withing range</p>
        ))}
      <div className={"divider"} />
      <Owned />
    </div>
  );
};
