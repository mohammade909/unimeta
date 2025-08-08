import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "allow_symbol_change": true,
        "calendar": false,
        "details": false,
        "hide_side_toolbar": true,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "hide_volume": false,
        "hotlist": false,
        "interval": "D",
        "locale": "en",
        "save_image": true,
        "style": "1",
        "symbol": "BINANCE:BTCUSDT",
        "theme": "dark",
        "timezone": "Etc/UTC",
        "backgroundColor": "#0F0F0F",
        "gridColor": "rgba(242, 242, 242, 0.06)",
        "autosize": false,
        "height": 480,
        "width": "100%",
        "withdateranges": false,
        "studies": []
      }`;

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full max-w-screen-xl mx-auto ">
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ width: '100%', height: '480px' }}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
