import { debounce } from "@mui/material";
import { LoadingAnimation } from "../Loading/Loading";
import { useState, useCallback, useEffect } from "react";
import { approveAndTradeOpen } from "../../calls/tradeOpen";
import { FinancialData } from "../../types/options";
import { getPremiaWithSlippage } from "../../utils/computations";
import { debug, LogTypes } from "../../utils/debugger";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { isLong, timestampToReadableDate } from "../../utils/utils";
import { ProfitGraph } from "../CryptoGraph/ProfitGraph";
import { getProfitGraphData } from "../CryptoGraph/profitGraphData";
import { fetchModalData } from "./fetchModalData";
import { ProfitTable, ProfitTableSkeleton } from "./ProfitTable";
import { useAccount } from "../../hooks/useAccount";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { UserBalance } from "../../types/wallet";
import { OptionWithPremia } from "../../classes/Option";
import style from "./card.module.css";
import buttonStyles from "../../style/button.module.css";
import { math64x61toDecimal } from "../../utils/units";
import { TokenKey } from "../../classes/Token";

type TemplateProps = {
  option: OptionWithPremia;
  inputText: string;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  Graph: () => JSX.Element;
  ProfitTable: () => JSX.Element;
  BuyButton: () => JSX.Element;
};

export const TradeCardTemplate = ({
  option,
  inputText,
  handleChange,
  Graph,
  ProfitTable,
  BuyButton,
}: TemplateProps) => {
  return (
    <div className={style.container}>
      <div className={style.top}>
        <h4>
          {option.sideAsText} {option.typeAsText}, strike price ${option.strike}
        </h4>
        <h4>Expiry {timestampToReadableDate(option.maturity * 1000)}</h4>
      </div>
      <div>
        <div className={style.left}>
          <div className={style.graphholder}>
            <Graph />
          </div>
          <div className={style.inputholder}>
            <span>Option Size</span>
            <input type="text" value={inputText} onChange={handleChange} />
          </div>
        </div>
        <div className={style.right}>
          <ProfitTable />
          <BuyButton />
        </div>
      </div>
    </div>
  );
};

export type TradeState = {
  failed: boolean;
  processing: boolean;
};

type TradeCardProps = {
  option: OptionWithPremia;
};

export const TradeCard = ({ option }: TradeCardProps) => {
  const account = useAccount();
  // base amount for BTC is 0.1 and 1 for anything else
  const baseAmount = option.underlying.id === TokenKey.BTC ? 0.1 : 1;
  const [amount, setAmount] = useState<number>(baseAmount);
  const [inputText, setInputText] = useState<string>(baseAmount.toString(10));
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<FinancialData | null>(null);
  const [premiaMath64, setPremiaMath64] = useState<bigint | undefined>();
  const [balance, setBalance] = useState<UserBalance | undefined>(undefined);
  const [tradeState, updateTradeState] = useState<TradeState>({
    failed: false,
    processing: false,
  });

  const handleChange = handleNumericChangeFactory(setInputText, setAmount);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callWithDelay = useCallback(
    debounce((size: number, controller: AbortController) => {
      fetchModalData(size, option, account, controller.signal)
        .then((v) => {
          if (v && v.prices && v.premiaMath64) {
            setData(v.prices);
            setBalance(v.balance);
            setPremiaMath64(v.premiaMath64);
            setLoading(false);
          }
        })
        .catch((e) => {
          debug("Failed fetching modal data");
          debug("warn", e.message);
        });
    }),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    callWithDelay(amount, controller);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const { strike, type, side } = option;

  if (loading || !data || !premiaMath64) {
    const graph = () => <LoadingAnimation />;
    const profitTable = () => <ProfitTableSkeleton symbol={option.symbol} />;
    const buyButton = () => <button disabled>Loading...</button>;

    return (
      <TradeCardTemplate
        option={option}
        inputText={inputText}
        handleChange={handleChange}
        Graph={graph}
        ProfitTable={profitTable}
        BuyButton={buyButton}
      />
    );
  }

  const premia = data.premia;

  const graphData = getProfitGraphData(
    type,
    side,
    strike,
    data.premiaUsd,
    amount
  );

  const handleBuy = async () => {
    if (!account) {
      debug(LogTypes.WARN, "No account", account);
      return;
    }

    if (!balance) {
      debug(LogTypes.WARN, "No user balance");
      return;
    }

    if (!amount) {
      showToast("Cannot trade size 0", ToastType.Warn);
      return;
    }

    const premiaWithSlippage = getPremiaWithSlippage(
      premiaMath64,
      option.side,
      false
    );

    updateTradeState({ failed: false, processing: true });

    approveAndTradeOpen(
      account,
      option,
      amount,
      math64x61toDecimal(premiaMath64),
      premiaWithSlippage,
      balance,
      updateTradeState
    ).catch(() => updateTradeState({ failed: true, processing: false }));
  };

  const BuyButton = () => (
    <button
      className={buttonStyles.green}
      disabled={tradeState.processing || !account || loading}
      onClick={handleBuy}
    >
      {tradeState.processing ? "Processing..." : isLong(side) ? "Buy" : "Sell"}
    </button>
  );

  return (
    <TradeCardTemplate
      option={option}
      inputText={inputText}
      handleChange={handleChange}
      Graph={() => ProfitGraph({ data: graphData })}
      ProfitTable={() =>
        ProfitTable({
          premia: data.premiaUsd,
          basePremia: data.sizeOnePremiaUsd,
          price: premia,
          option,
        })
      }
      BuyButton={BuyButton}
    />
  );
};
