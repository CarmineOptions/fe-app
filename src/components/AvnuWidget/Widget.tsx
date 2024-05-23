import { useEffect, useRef, useState } from "react";
import { executeSwap, fetchQuotes, Quote } from "@avnu/avnu-sdk";
import { formatUnits, parseUnits } from "ethers";
import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { TokenDisplay, TokenSelect } from "./TokenSelect";
import { EthToken, Token, UsdcToken } from "../../classes/Token";
import { LoadingAnimation } from "../Loading/Loading";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";
import { ToastType } from "../../redux/reducers/ui";
import { maxDecimals } from "../../utils/utils";

import styles from "./widget.module.css";
import inputStyles from "../../style/input.module.css";
import buttonStyles from "../../style/button.module.css";
import { Skeleton } from "@mui/material";

const AVNU_BASE_URL = "https://starknet.api.avnu.fi";
const CARMINE_BENEFICIARY_ADDRESS =
  "0x075ba47add11bab612a0e7f4e6780e11b37b21721705e06274a97a5d91ca904a";

const AVNU_OPTIONS = { baseUrl: AVNU_BASE_URL };
const AVNU_BASE_PARAMS = {
  size: 1,
  integratorFees: 0n,
  integratorFeeRecipient: CARMINE_BENEFICIARY_ADDRESS,
  integratorName: "Carmine Options AMM",
};

const DownAngled = () => (
  <div style={{ transform: "rotate(90deg)", paddingLeft: "12px" }}>&rang;</div>
);

const QuoteBox = ({
  quote,
  buyToken,
  sellToken,
  refresh,
}: {
  quote: Quote;
  buyToken: Token;
  sellToken: Token;
  refresh: () => void;
}) => (
  <div className={styles.quotebox}>
    {quote.buyTokenPriceInUsd !== undefined &&
      quote.sellTokenPriceInUsd !== undefined && (
        <div>
          <span>
            Price{" "}
            <span style={{ cursor: "pointer" }} onClick={refresh}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 13 13"
                fill="none"
              >
                <path
                  d="M12.3162 5.1875C12.3162 5.49922 12.0654 5.75 11.7537 5.75H9.12866H8.37866C8.06694 5.75 7.81616 5.49922 7.81616 5.1875C7.81616 4.87578 8.06694 4.625 8.37866 4.625H9.12866H10.3966L9.17554 3.40391C8.5146 2.74531 7.62163 2.375 6.69116 2.375C4.98726 2.375 3.52241 3.40859 2.89429 4.88516C2.77241 5.17109 2.44194 5.30469 2.15601 5.18281C1.87007 5.06094 1.73647 4.73047 1.85835 4.44453C2.65757 2.56719 4.52085 1.25 6.69116 1.25C7.92163 1.25 9.10054 1.7375 9.97007 2.60703L11.1912 3.83047V2.5625V2.55312V1.8125C11.1912 1.50078 11.4419 1.25 11.7537 1.25C12.0654 1.25 12.3162 1.50078 12.3162 1.8125V5.1875ZM1.62866 7.25H4.25366C4.56538 7.25 4.81616 7.50078 4.81616 7.8125C4.81616 8.12422 4.56538 8.375 4.25366 8.375H2.98569L4.20679 9.59609C4.86772 10.2547 5.76069 10.625 6.69116 10.625C8.39272 10.625 9.85522 9.59609 10.4857 8.12188C10.6076 7.83594 10.938 7.70469 11.224 7.82656C11.5099 7.94844 11.6412 8.27891 11.5193 8.56484C10.7177 10.4375 8.85913 11.75 6.69116 11.75C5.46069 11.75 4.28179 11.2625 3.41226 10.393L2.19116 9.16953V10.4375C2.19116 10.7492 1.94038 11 1.62866 11C1.31694 11 1.06616 10.7492 1.06616 10.4375V7.8125C1.06616 7.50078 1.31694 7.25 1.62866 7.25Z"
                  fill="#888"
                ></path>
              </svg>
            </span>
          </span>
          <span>
            1 {sellToken.symbol} ={" "}
            {maxDecimals(
              quote.sellTokenPriceInUsd / quote.buyTokenPriceInUsd,
              4
            )}{" "}
            {buyToken.symbol} ≈ ${maxDecimals(quote.sellTokenPriceInUsd, 2)}
          </span>
        </div>
      )}
    <div>
      <span>Gas fee</span>
      <span>${maxDecimals(quote.gasFeesInUsd, 2)}</span>
    </div>
    <div>
      <span>Service fee</span>
      <span>
        ${maxDecimals(quote.avnuFeesInUsd + quote.integratorFeesInUsd, 2)}
      </span>
    </div>
  </div>
);

export const Widget = () => {
  const account = useAccount();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(inputValue);
  const [sellAmount, setSellAmount] = useState<string>();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [tokenSelectOpen, setTokenSelectOpen] = useState<
    undefined | "buy" | "sell"
  >(undefined);
  const [sellToken, setSellToken] = useState<Token>(EthToken);
  const [buyToken, setBuyToken] = useState<Token>(UsdcToken);
  const [refreshCounter, setRefresh] = useState(0);

  const refresh = () => setRefresh(refreshCounter + 1);

  const handleInputChange = (value: string) => {
    // Allow empty string, valid number, or a single decimal point followed by numbers
    const numericValue =
      value === "" || /^\d*\.?\d*$/.test(value) ? value : inputValue;
    setInputValue(numericValue);
  };

  const handleArrowClick = () => {
    const sellTokenCopy = sellToken;
    setSellToken(buyToken);
    setBuyToken(sellTokenCopy);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchData = async () => {
      if (!account || buyToken.id === sellToken.id) {
        setQuotes([]);
        return;
      }

      const num = parseFloat(debouncedValue);

      if (num === 0 || isNaN(num)) {
        setQuotes([]);
        return;
      }

      abortControllerRef.current = new AbortController();
      const abortSignal = abortControllerRef.current.signal;

      setErrorMessage("");
      setQuotes([]);
      setSellAmount(debouncedValue);
      setLoading(true);
      const params = {
        ...AVNU_BASE_PARAMS,
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount: parseUnits(debouncedValue, sellToken.decimals),
        takerAddress: account.address,
      };
      console.log(params);
      fetchQuotes(params, { baseUrl: AVNU_BASE_URL, abortSignal })
        .then((quotes) => {
          setLoading(false);
          console.log(quotes);
          setQuotes(quotes);
        })
        .catch(() => setLoading(false));
    };

    if (debouncedValue) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, sellToken, buyToken, refreshCounter, account]);

  const handleSwap = async () => {
    if (!account || !sellAmount || !quotes || !quotes[0]) return;
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    executeSwap(account, quotes[0], {}, AVNU_OPTIONS)
      .then((resp) => {
        setSuccessMessage("success");
        setLoading(false);
        setQuotes([]);
        const hash = resp.transactionHash;
        addTx(hash, `swap-${hash}`, TransactionAction.Swap);
        afterTransaction(
          hash,
          () => {
            markTxAsDone(hash);
            showToast("Swap successfull", ToastType.Success);
          },
          () => {
            markTxAsFailed(hash);
            showToast("Swap failed", ToastType.Error);
          }
        );
      })
      .catch((error: Error) => {
        console.log(error);
        setLoading(false);
        setErrorMessage(error.message);
      });
  };

  if (!account) {
    return <button onClick={openWalletConnectDialog}>Connect Wallet</button>;
  }

  return (
    <div className={styles.container}>
      {tokenSelectOpen !== undefined && (
        <TokenSelect
          close={() => setTokenSelectOpen(undefined)}
          setSelection={tokenSelectOpen === "sell" ? setSellToken : setBuyToken}
        />
      )}
      <div className={styles.tokeninput}>
        <div className={styles.moneywrapper}>
          <input
            className={inputStyles.input}
            placeholder="0"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <span>
            {quotes && quotes[0]
              ? `~$${quotes[0].buyAmountInUsd.toFixed(2)}`
              : "~$ --"}
          </span>
        </div>

        <div
          style={{ display: "flex" }}
          className={styles.row}
          onClick={() => setTokenSelectOpen("sell")}
        >
          <TokenDisplay token={sellToken} />
          <DownAngled />
        </div>
      </div>
      <div>
        <div
          style={{
            cursor: "pointer",
            textAlign: "center",
            padding: "20px",
            width: "50px",
            margin: "auto",
          }}
          onClick={handleArrowClick}
        >
          &darr;
        </div>
      </div>
      <div>
        <div className={styles.tokeninput}>
          <div className={styles.moneywrapper}>
            <input
              className={inputStyles.input}
              placeholder="0"
              readOnly
              type="text"
              id="buy-amount"
              value={
                quotes && quotes[0]
                  ? formatUnits(quotes[0].buyAmount, buyToken.decimals)
                  : ""
              }
            />
            <span>
              {quotes && quotes[0]
                ? `~$${quotes[0].buyAmountInUsd.toFixed(2)}`
                : "~$ --"}
            </span>
          </div>
          <div
            style={{ display: "flex" }}
            className={styles.row}
            onClick={() => setTokenSelectOpen("buy")}
          >
            <TokenDisplay token={buyToken} />
            <DownAngled />
          </div>
        </div>
      </div>
      {quotes && quotes[0] ? (
        <QuoteBox
          quote={quotes[0]}
          buyToken={buyToken}
          sellToken={sellToken}
          refresh={refresh}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          className={styles.quotebox}
          height={85}
        />
      )}
      {loading ? (
        <button disabled className={buttonStyles.disabled}>
          <LoadingAnimation />
        </button>
      ) : (
        quotes && quotes[0] && <button onClick={handleSwap}>Swap</button>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>Success</p>}
    </div>
  );
};
