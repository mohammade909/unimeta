import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative overflow-hidden ">
      {/* Background Video */}
       <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[calc(100vh*1.77778)] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[-1]">
          <iframe
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title="hero bg FSM"
            src="https://www.youtube.com/embed/koPkElMab4U?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=koPkElMab4U"
            // src="https://www.youtube.com/embed/wZdCNuOFhXI?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=wZdCNuOFhXI&playsinline=1&enablejsapi=1"
          ></iframe>
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-2 items-center gap-10">
          {/* Left Section */}
          <div
            className={`space-y-4 transform transition-all duration-1000 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 mt-10 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-[#7db65e] text-xs font-medium uppercase tracking-wider">
                #1 Crypto Arbitrage Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
              Arbitrage Trading. <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-[#7db65e] to-red-500 text-transparent bg-clip-text">
                Smarter Crypto Profits.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base lg:text-lg max-w-xl">
              UniMeta uses automated arbitrage trading to buy low and sell high across different crypto exchanges — helping you earn daily profits without any trading skills or market stress.
            </p>

            {/* Button */}
            <div className="pt-4">
              <button className="bg-[#7db65e] hover:bg-[#6da94c]  text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-orange-500/30 transition-transform transform hover:scale-105">
                GET STARTED
              </button>
            </div>
          </div>

          {/* Right Side Image */}
          <img src="https://fsmmarkets.com/assets/img/fsm-market.png" alt="Hero Visual" />
        </div>
      </div>
    </div>
  );
}
