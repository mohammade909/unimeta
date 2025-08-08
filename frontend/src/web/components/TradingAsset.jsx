import React from "react";
import { TrendingUp, Coins, BarChart3, Bitcoin } from "lucide-react";

export default function TradingAsset() {
  return (
      <div id="trading"
  className=" py-8 bg-white"
  style={{
    backgroundImage: `url('/bgimg1.png')`, // Replace with actual path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
         <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-lime-500 via-[#7db65e] to-rose-500 text-transparent bg-clip-text">
            Trading
          </span>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
           What You Get {" "}
            <span className="text-red-500">with UniMeta</span>
          </h2>
          </div>
        <button className="bg-[#7db65e] hover:bg-[#6da94c] text-white px-6 py-3 rounded-full font-semibold transition duration-300">
          Open Live Account
        </button>
      </div>
      <div className=" relative">
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 relative sm:pb-52">
          <div className="transform translate-y-0">
            <div className="bg-green-200 rounded-md p-6 relative overflow-hidden shadow-md">
              <div className="">
                <img src="/img1.png" className="w-28 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Daily Crypto Profits
                </h3>
              </div>
              <p className="text-gray-700 text-base font-medium text-justify mb-6">
                Our system takes advantage of price differences between exchanges to give you steady daily returns — all without lifting a finger.
              </p>
              <button className="bg-[#7db65e] hover:bg-[#6da94c] text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300">
                Learn more
              </button>
            </div>
          </div>
          <div className="transform translate-y-0 sm:translate-y-10">
            <div className="bg-yellow-100 rounded-md p-6 relative overflow-hidden shadow-md">
               <div className="">
                <img src="/img2.png" className="w-28 mb-0" />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Zero Trading Knowledge Required
                </h3>
              </div>
              <p className="text-gray-700 text-base font-medium text-justify mb-6">
                You don’t need to understand charts or strategies. Just create an account, deposit funds, and let our bots handle the rest.
              </p>
              <button className="bg-[#7db65e] hover:bg-[#6da94c] text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300">
                Learn more
              </button>
              
            </div>
          </div>
          <div className="transform translate-y-0 sm:translate-y-32">
            <div className="bg-yellow-50 rounded-md p-6 relative overflow-hidden shadow-md">
               <div className="">
                <img src="/img3.png" className="w-28 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Real-Time Market Scanning
                </h3>
              </div>
              <p className="text-gray-700 text-base font-medium text-justify mb-4">
                UniMeta’s AI-powered bots scan top crypto exchanges 24/7, instantly spotting and executing the best buy-low, sell-high opportunities.
              </p>
              <button className="bg-[#7db65e] hover:bg-[#6da94c] text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300">
                Learn more
              </button>
             
            </div>
          </div>
          <div className="transform translate-y-0 sm:translate-y-44 relative">
            <div className="bg-purple-100 rounded-md p-6 relative overflow-hidden shadow-md">
               <div className="">
                <img src="/img4.png" className="w-28 mb-2" />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Secure and Transparent System
                </h3>
              </div>
              <p className="text-gray-700 text-base font-medium text-justify mb-6">
                our funds are protected with advanced security, and you can track all trades and profits in real time — no hidden steps, no surprises.
              </p>
              <button className="bg-[#7db65e] hover:bg-[#6da94c] text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300">
                Learn more
              </button>
              
            </div>
            {/* <div className="absolute -top-36 right-20 hidden md:block">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full animate-spin-slow">
                  <defs>
                    <path
                      id="circle"
                      d="M 64,64 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
                    />
                  </defs>
                  <text className="text-xs fill-gray-600 font-semibold">
                    <textPath href="#circle">
                      @ CROSS MARKET • PLATFORM • DOWNLOAD NOW July 2025•
                    </textPath>
                  </text>
                </svg>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      </div>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
