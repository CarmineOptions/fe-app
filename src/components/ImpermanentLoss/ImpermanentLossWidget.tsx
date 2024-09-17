import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import { LoadingAnimation } from "../Loading/Loading";
import { useCallback, useEffect, useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { formatNumber, uniquePrimitiveValues } from "../../utils/utils";
import { debounce, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { StrkToken, UsdcToken, EthToken } from "../../classes/Token";
import { PairNamedBadge, TokenNamedBadge } from "../TokenBadge";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { debug } from "../../utils/debugger";
import { buyImpLoss, getPrice, ILPrice } from "./getPrice";
import { longInteger, shortInteger } from "../../utils/computations";
import { TransactionState } from "../../types/network";
import { useAccount } from "../../hooks/useAccount";
import { useCurrency } from "../../hooks/useCurrency";
import { openWalletConnectDialog } from "../ConnectWallet/Button";

import styles from "./imp_loss.module.css";

export const ImpermanentLossWidget = () => {
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const account = useAccount();
  const [pair, setPair] = useState<PairKey>(PairKey.ETH_STRK);
  const [selectedMaturity, setSelectedMaturity] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(1);
  const [amountText, setAmountText] = useState<string>("1");
  const [price, setPrice] = useState<ILPrice | undefined>();
  const [txStatus, setTxStatus] = useState<TransactionState>(
    TransactionState.Initial
  );
  const tokenPair = Pair.pairByKey(pair);
  const baseTokenPrice = useCurrency(tokenPair.baseToken.id);
  const quoteTokenPrice = useCurrency(tokenPair.quoteToken.id);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((amount: number, controller: AbortController) => {
      if (selectedMaturity === undefined || amount === 0) {
        return;
      }

      if (
        txStatus === TransactionState.Fail ||
        txStatus === TransactionState.Success
      ) {
        setTxStatus(TransactionState.Initial);
      }

      setLoading(true);
      // unset old price
      setPrice(undefined);

      getPrice(
        longInteger(amount, tokenPair.baseToken.decimals),
        tokenPair,
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
        });
    }),
    [selectedMaturity, amount, pair]
  );

  useEffect(() => {
    const controller = new AbortController();
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

  const sizeRaw = longInteger(amount, tokenPair.baseToken.decimals);

  const handlePairChange = (event: SelectChangeEvent) => {
    setPair(event.target.value as PairKey);
  };

  const handleInputChange = handleNumericChangeFactory(
    setAmountText,
    setAmount,
    (n) => {
      return n;
    }
  );

  const handleBuy = () => {
    if (!account || !selectedMaturity || !price) {
      return;
    }
    buyImpLoss(
      account,
      sizeRaw,
      tokenPair,
      selectedMaturity,
      price,
      setTxStatus
    );
  };

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
    <div className={styles.container}>
      <h2>Impermanent Loss Protect</h2>
      <div>
        <p className="p4 secondary-col">Pair</p>
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
          </Select>
        </div>
        {baseTokenPrice && quoteTokenPrice ? (
          <p className="p4 secondary-col">
            1 {tokenPair.baseToken.symbol} ~{" "}
            {formatNumber(baseTokenPrice / quoteTokenPrice)}{" "}
            {tokenPair.quoteToken.symbol}
          </p>
        ) : (
          <LoadingAnimation size={20} />
        )}
        <div className={styles.inputcontainer}>
          <p className="p4 secondary-col">{tokenPair.baseToken.symbol}</p>
          <div className={styles.tokeninput}>
            <div>
              <input
                onChange={handleInputChange}
                type="text"
                placeholder="base size"
                value={amountText}
                className="white-col"
              />
              <p className="p4 secondary-col">
                {baseTokenPrice ? (
                  "$" + formatNumber(amount * baseTokenPrice)
                ) : (
                  <LoadingAnimation size={20} />
                )}
              </p>
            </div>
            <div>
              <TokenNamedBadge token={tokenPair.baseToken} size="small" />
            </div>
          </div>
          <p className="p4 secondary-col">{tokenPair.quoteToken.symbol}</p>

          <div className={styles.tokeninput}>
            <div>
              <input
                type="text"
                placeholder="quote size"
                value={
                  amount && baseTokenPrice && quoteTokenPrice
                    ? formatNumber((amount * baseTokenPrice) / quoteTokenPrice)
                    : ""
                }
                disabled
              />
              <p className="p4 secondary-col">
                {baseTokenPrice ? (
                  "$" + formatNumber(amount * baseTokenPrice)
                ) : (
                  <LoadingAnimation size={20} />
                )}
              </p>
            </div>
            <div>
              <TokenNamedBadge token={tokenPair.quoteToken} size="small" />
            </div>
          </div>
        </div>

        <p className="p4 secondary-col">Duration</p>
        <div className={styles.buttoncontainer}>
          {maturities.map((m, i) => {
            const className =
              m === selectedMaturity ? "active secondary" : "secondary";

            return (
              <button
                className={className}
                key={i}
                onClick={() => setSelectedMaturity(m)}
              >
                {formatTimestamp(m)}
              </button>
            );
          })}
        </div>

        <div className="divider topmargin botmargin" />

        {loading || !price ? (
          <LoadingAnimation />
        ) : (
          <div>
            <div className={styles.coverageprice}>
              <div>
                <p className="p4 secondary-col">Final coverage price</p>
              </div>
              <div>
                <p>
                  {formatNumber(
                    shortInteger(price.basePrice, tokenPair.baseToken.decimals),
                    5
                  )}{" "}
                  {tokenPair.baseToken.symbol}
                </p>
                <p>
                  {formatNumber(
                    shortInteger(
                      price.quotePrice,
                      tokenPair.quoteToken.decimals
                    ),
                    5
                  )}{" "}
                  {tokenPair.quoteToken.symbol}
                </p>
              </div>
            </div>
            <div className="topmargin">
              {account === undefined && (
                <button
                  className="primary active mainbutton"
                  onClick={openWalletConnectDialog}
                >
                  Connect Wallet
                </button>
              )}
              {account && txStatus === TransactionState.Initial && (
                <button
                  className="primary active mainbutton"
                  onClick={handleBuy}
                >
                  Protect
                </button>
              )}
              {account && txStatus === TransactionState.Success && (
                <button className="green active mainbutton" onClick={handleBuy}>
                  Success
                </button>
              )}
              {account && txStatus === TransactionState.Fail && (
                <button className="red active mainbutton" onClick={handleBuy}>
                  Fail
                </button>
              )}
              {account && txStatus === TransactionState.Processing && (
                <button className="primary active mainbutton" disabled>
                  <LoadingAnimation size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
