import { memo, useEffect, useRef } from "react";
import { PairKey } from "../../classes/Pair";

export const TradingViewChart = memo(({ symbols }: { symbols: string }) => {
  const container = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
    {
      "symbols": ${symbols},
      "chartOnly": false,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "colorTheme": "dark",
      "autosize": true,
      "showVolume": false,
      "showMA": false,
      "hideDateRanges": false,
      "hideMarketStatus": false,
      "hideSymbolLogo": false,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "IBM Plex Sans, sans-serif, -apple-system, sans-serif",
      "fontSize": "10",
      "noTimeScale": false,
      "valuesTracking": "1",
      "changeMode": "price-and-percent",
      "chartType": "area",
      "maLineColor": "#2962FF",
      "maLineWidth": 1,
      "maLength": 9,
      "backgroundColor": "rgba(0, 0, 0, 1)",
      "lineWidth": 2,
      "lineType": 0,
      "dateRanges": [
        "1d|1",
        "1m|30",
        "3m|60",
        "12m|1D",
        "60m|1W",
        "all|1M"
      ]
    }`;
    (container!.current! as HTMLElement).appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow noreferrer"
          target="_blank"
        >
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

export const TradingViewMultichart = memo(({ pair }: { pair: PairKey }) => {
  const show =
    pair === PairKey.BTC_USDC ? 1 : pair === PairKey.STRK_USDC ? 2 : 3;

  const btcTicker = ["BINANCE:wBTCUSD|1M|USD"];
  const ethTicker = ["BINANCE:ETHUSD|1M|USD"];
  const strkTicker = ["BINANCE:STRKUSD|1M|USD"];

  return (
    <div className="h-full">
      <div className={`h-full${show !== 1 ? " hidden" : ""}`}>
        <TradingViewChart
          symbols={JSON.stringify([btcTicker, ethTicker, strkTicker])}
        />
      </div>
      <div className={`h-full${show !== 2 ? " hidden" : ""}`}>
        <TradingViewChart
          symbols={JSON.stringify([strkTicker, ethTicker, btcTicker])}
        />
      </div>
      <div className={`h-full${show !== 3 ? " hidden" : ""}`}>
        <TradingViewChart
          symbols={JSON.stringify([ethTicker, strkTicker, btcTicker])}
        />
      </div>
    </div>
  );
});
