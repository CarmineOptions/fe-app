import { memo, useEffect, useRef } from "react";

type Props = {
  ticker: string;
};

export const SingleTokenGraph = memo(({ ticker }: Props) => {
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
  }, []);

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

type SingleTokenMultichartProps = {
  token: string;
};

export const SingleTokenMultichart = ({
  token,
}: SingleTokenMultichartProps) => {
  const show = token === "STRK" ? 1 : token === "wBTC" ? 2 : 3;
  return (
    <div className="h-full">
      <div className={`h-full${show === 1 ? "" : " hidden"}`}>
        <SingleTokenGraph ticker="COINBASE:STRKUSD" />
      </div>
      <div className={`h-full${show === 2 ? "" : " hidden"}`}>
        <SingleTokenGraph ticker="BINANCE:wBTCUSD" />
      </div>
      <div className={`h-full${show === 3 ? "" : " hidden"}`}>
        <SingleTokenGraph ticker="BINANCE:ETHUSD" />
      </div>
    </div>
  );
};
