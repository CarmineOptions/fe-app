import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import { LoadingAnimation } from "../Loading/Loading";
import { useCallback, useEffect, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { uniquePrimitiveValues } from "../../utils/utils";
import { debounce, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { StrkToken, UsdcToken, EthToken, BtcToken } from "../../classes/Token";
import { PairNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { debug } from "../../utils/debugger";
import { getPrice, ILPrice } from "./getPrice";
import { longInteger, shortInteger } from "../../utils/computations";

export const ImpermanentLossWidget = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const [pair, setPair] = useState<PairKey>(PairKey.STRK_USDC);
  const [selectedMaturity, setSelectedMaturity] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");
  const [price, setPrice] = useState<ILPrice | undefined>();
  const [error, setError] = useState<string | undefined>();
  const tokenPair = Pair.pairByKey(pair);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((amount: number, controller: AbortController) => {
      if (selectedMaturity === undefined) {
        return;
      }
      // unset old price
      setPrice(undefined);
      setError(undefined);

      getPrice(
        longInteger(amount, tokenPair.baseToken.decimals),
        tokenPair.baseToken.address,
        tokenPair.quoteToken.address,
        selectedMaturity,
        controller.signal
      )
        .then((v) => {
          setPrice(v);
          setLoading(false);
        })
        .catch((e) => {
          debug("Failed fetching modal data");
          debug("warn", e.message);
          setLoading(false);
          setError(e.message);
        });
    }),
    [selectedMaturity, amount, pair]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    callWithDelay(amount, controller);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaturity, amount, pair]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <p>Something went wrong</p>;
  }

  const thisPairOptions = data.filter((option) => option.isPair(pair));

  const maturities = thisPairOptions
    .map((o) => o.maturity)
    .filter(uniquePrimitiveValues);

  const handlePairChange = (event: SelectChangeEvent) => {
    setPair(event.target.value as PairKey);
  };

  const handleMaturityChange = (event: SelectChangeEvent<number>) => {
    setSelectedMaturity(event.target.value as number);
  };

  const handleInputChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  if (
    selectedMaturity === undefined ||
    !maturities.includes(selectedMaturity)
  ) {
    if (maturities.length > 0) {
      setSelectedMaturity(maturities[0]);
    }
  }

  return (
    <div>
      <h1>Impermanenct Loss</h1>
      <h3>Pair</h3>
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
            width: "270px",
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
          <MenuItem value={PairKey.BTC_USDC}>
            <PairNamedBadge tokenA={BtcToken} tokenB={UsdcToken} />
          </MenuItem>
        </Select>
      </div>
      <h3>Maturity</h3>
      <div>
        <Select
          value={selectedMaturity}
          onChange={handleMaturityChange}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              { padding: 0 },
          }}
        >
          {maturities.map((m, i) => {
            return (
              <MenuItem key={i} value={m}>
                {formatTimestamp(m)}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      <h3>Size</h3>
      <input
        onChange={handleInputChange}
        type="text"
        placeholder="size"
        value={amountText}
      />

      {loading ? (
        <LoadingAnimation />
      ) : (
        price && (
          <div>
            <div>
              <h3>Calldata</h3>
              <div>
                <ul>
                  <li>
                    {longInteger(
                      amount,
                      tokenPair.baseToken.decimals
                    ).toString()}
                  </li>
                  <li>{tokenPair.baseToken.address}</li>
                  <li>{tokenPair.quoteToken.address}</li>
                  <li>{selectedMaturity}</li>
                </ul>
              </div>
            </div>
            <div>
              <h3>Response</h3>
              <div>
                <h4>Raw</h4>
                <p>
                  [{price.basePrice.toString()}, {price.quotePrice.toString()}]
                </p>
              </div>
              <div>
                <h4>Human Readable</h4>
                <div>
                  <ul>
                    <li>
                      {tokenPair.baseToken.symbol}{" "}
                      {shortInteger(
                        price.basePrice,
                        tokenPair.baseToken.decimals
                      )}
                    </li>
                    <li>
                      {tokenPair.quoteToken.symbol}{" "}
                      {shortInteger(
                        price.quotePrice,
                        tokenPair.quoteToken.decimals
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {error && (
        <div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
