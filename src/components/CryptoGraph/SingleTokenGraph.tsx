import { memo, useEffect, useRef } from "react";
import { TokenKey } from "../../classes/Token";

type Props = {
  token: TokenKey;
};

const tokenKeyTickerMap: {
  [key in TokenKey]: string;
} = {
  [TokenKey.ETH]: "BINANCE:ETHUSD",
  [TokenKey.BTC]: "BINANCE:wBTCUSD",
  [TokenKey.STRK]: "BINANCE:STRKUSD",
  [TokenKey.USDC]: "",
  [TokenKey.EKUBO]: "",
};

export const SingleTokenGraph = memo(({ token }: Props) => {
  const ticker = tokenKeyTickerMap[token];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbol: ticker,
        width: "100%",
        height: "100%",
        locale: "en",
        dateRange: "1M",
        colorTheme: "dark",
        isTransparent: false,
        autosize: true,
        largeChartUrl: "",
      });

      containerRef.current.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});
