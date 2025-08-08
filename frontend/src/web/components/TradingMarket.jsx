import React, { useEffect, useRef, memo } from 'react';

function TradingMarket() {
  const container = useRef();

  useEffect(() => {
    // Clear existing widget on refresh or remount
    container.current.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
    `;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
          { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
          { "proName": "BINANCE:XRPUSDT", "title": "XRPUSDT" },
          { "proName": "BINANCE:SOLUSDT", "title": "SOLUSDT" },
          { "proName": "BINANCE:DOGEUSDT", "title": "DOGEUSDT" },
          { "proName": "BINANCE:TRXUSDT", "title": "TRXUSDT" },
          { "proName": "BINANCE:SUIUSDT", "title": "SUIUSDT" },
          { "proName": "BINANCE:BNBUSDT", "title": "BNBUSDT" },
          { "proName": "BINANCE:SHIBUSDT", "title": "SHIBUSDT" },
          { "proName": "BINANCE:CKBUSDT", "title": "CKBUSDT" }
        ],
        "colorTheme": "dark",
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": false,
        "showSymbolLogo": true,
        "displayMode": "adaptive"
      }`;

    // Append script to container
    container.current.querySelector(".tradingview-widget-container__widget").appendChild(script);
  }, []);

  return (
    <div
      ref={container}
      className="tradingview-widget-container w-full bg-gray-900 shadow-lg overflow-hidden"
    />
  );
}

export default memo(TradingMarket);
