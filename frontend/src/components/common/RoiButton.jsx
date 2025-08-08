import React, { useState, useEffect } from "react";
import { useIncome } from "../../hooks/useUserApi";

// Normal ROI Success Modal
const NormalROIModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ROI Processed Successfully!
          </h3>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Total ROI Amount:</span>
              <span className="font-semibold text-green-600">
                ${data?.total_roi_amount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base Amount:</span>
              <span className="font-semibold">${data?.total_base_amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Investments Processed:</span>
              <span className="font-semibold">{data?.total_processed}</span>
            </div>
            <div className="flex justify-between">
              <span>Successful:</span>
              <span className="font-semibold text-green-600">
                {data?.successful}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Booster ROI Success Modal
const BoosterROIModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const detail = data?.details[0]; // Get first detail for booster info

  if (!detail) {  
    return
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-50 to-yellow-50 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🚀</span>
            </div>
          </div>

          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-yellow-600 bg-clip-text text-transparent mb-2">
            Booster ROI Activated!
          </h3>

          <div className="space-y-3 text-sm mb-6">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total ROI Amount:</span>
                <span className="font-bold text-lg text-green-600">
                  ${data?.total_roi_amount}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Base Amount: ${data?.total_base_amount}</span>
                <span className="text-purple-600">
                  + Booster: ${data?.total_booster_amount}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-purple-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (data?.total_booster_amount / data?.total_roi_amount) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {detail && (
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Booster Level:</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                    L{detail?.booster_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-500">Base %</div>
                    <div className="font-semibold">
                      {(detail?.base_percentage * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Boosted %</div>
                    <div className="font-semibold text-purple-600">
                      {(detail?.boosted_percentage * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {detail?.applied_boosts && (
                  <div className="mt-2 text-xs">
                    <div className="text-gray-500 mb-1">Applied Boosts:</div>
                    <div className="flex justify-between">
                      <span>Referral Boost:</span>
                      <span className="text-green-600">
                        +
                        {(detail?.applied_boosts?.referral_boost * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level Boost:</span>
                      <span className="text-purple-600">
                        +
                        {(
                          detail?.applied_boosts?.booster_level_boost * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-yellow-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-yellow-600 transition-all transform hover:scale-105"
          >
            Amazing! Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export const RoiButton = () => {
  const { processSelfROI, loading, roiData, clearData } = useIncome();
  const [showNormalModal, setShowNormalModal] = useState(false);
  const [showBoosterModal, setShowBoosterModal] = useState(false);

  // console.log("ROI Data:", roiData);
  // Use useEffect to watch for roiData changes
  useEffect(() => {
    if (roiData && roiData.success) {
      // Check if there's booster amount to determine which modal to show
      const hasBooster = roiData.total_booster_amount > 0;

      if (hasBooster) {
        setShowBoosterModal(true);
        // Auto close after 5 seconds
        setTimeout(() => {
          setShowBoosterModal(false);
        }, 5000);
      } else {
        setShowNormalModal(true);
        // Auto close after 3 seconds
        setTimeout(() => {
          setShowNormalModal(false);
        }, 3000);
      }
    }
  }, [roiData]);

  const handleROIProcess = async () => {
    try {
      await processSelfROI();
      // The response will be handled by the useEffect above when roiData updates
    } catch (error) {
      console.error("Error processing ROI:", error);
      // Handle error state here if needed
    }
  };

  return (
    <>
      <button
        onClick={handleROIProcess}
        disabled={loading}
        style={{
          WebkitBoxReflect:
            "below 0px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4))",
        }}
        className={`px-10 py-3 bg-gradient-to-r from-red-500 to-green-500 rounded-full shadow-xl group-hover:shadow-2xl group-hover:shadow-red-600 shadow-red-600 uppercase font-serif tracking-widest relative overflow-hidden group text-transparent z-10 after:absolute after:rounded-full after:bg-red-200 after:h-[85%] after:w-[95%] after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 hover:saturate-[1.15] active:saturate-[1.4] ${
          loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        Button
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <p
          className={`absolute z-40 font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent top-1/2 left-1/2 -translate-x-1/2 group-hover:-translate-y-full h-full w-full transition-all duration-300 -translate-y-[30%] tracking-widest ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
        Trade Now
        </p>
        <p
          className={`absolute z-40 top-1/2 left-1/2 bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent -translate-x-1/2 translate-y-full h-full w-full transition-all duration-300 group-hover:-translate-y-[40%] tracking-widest font-extrabold ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
          Trade Now
        </p>
        {/* SVG animations - keeping original */}
        <svg
          className="absolute w-full h-full scale-x-125 rotate-180 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group-hover:animate-none animate-pulse group-hover:-translate-y-[45%] transition-all duration-300"
          viewBox="0 0 2400 800"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="sssurf-grad"
              y2="100%"
              x2="50%"
              y1="0%"
              x1="50%"
            >
              <stop offset="0%" stopOpacity={1} stopColor="hsl(37, 99%, 67%)" />
              <stop
                offset="100%"
                stopOpacity={1}
                stopColor="hsl(316, 73%, 52%)"
              />
            </linearGradient>
          </defs>
          <g
            transform="matrix(1,0,0,1,0,-91.0877685546875)"
            fill="url(#sssurf-grad)"
          >
            <path
              opacity="0.05"
              transform="matrix(1,0,0,1,0,35)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity="0.21"
              transform="matrix(1,0,0,1,0,70)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity="0.37"
              transform="matrix(1,0,0,1,0,105)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity="0.53"
              transform="matrix(1,0,0,1,0,140)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity="0.68"
              transform="matrix(1,0,0,1,0,175)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity="0.84"
              transform="matrix(1,0,0,1,0,210)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
            <path
              opacity={1}
              transform="matrix(1,0,0,1,0,245)"
              d="M 0 305.9828838196134 Q 227.6031525693441 450 600 302.17553022897005 Q 1010.7738828515054 450 1200 343.3024459932802 Q 1379.4406250195766 450 1800 320.38902780838214 Q 2153.573162029817 450 2400 314.38564046970816 L 2400 800 L 0 800 L 0 340.3112176762882 Z"
            />
          </g>
        </svg>
        <svg
          className="absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-[30%] group-hover:-translate-y-[33%] group-hover:scale-95 transition-all duration-500 z-40 fill-red-500"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,288L9.2,250.7C18.5,213,37,139,55,133.3C73.8,128,92,192,111,224C129.2,256,148,256,166,256C184.6,256,203,256,222,250.7C240,245,258,235,277,213.3C295.4,192,314,160,332,170.7C350.8,181,369,235,388,229.3C406.2,224,425,160,443,122.7C461.5,85,480,75,498,74.7C516.9,75,535,85,554,101.3C572.3,117,591,139,609,170.7C627.7,203,646,245,665,256C683.1,267,702,245,720,245.3C738.5,245,757,267,775,266.7C793.8,267,812,245,831,234.7C849.2,224,868,224,886,218.7C904.6,213,923,203,942,170.7C960,139,978,85,997,53.3C1015.4,21,1034,11,1052,48C1070.8,85,1089,171,1108,197.3C1126.2,224,1145,192,1163,197.3C1181.5,203,1200,245,1218,224C1236.9,203,1255,117,1274,106.7C1292.3,96,1311,160,1329,170.7C1347.7,181,1366,139,1385,128C1403.1,117,1422,139,1431,149.3L1440,160L1440,320L1430.8,320C1421.5,320,1403,320,1385,320C1366.2,320,1348,320,1329,320C1310.8,320,1292,320,1274,320C1255.4,320,1237,320,1218,320C1200,320,1182,320,1163,320C1144.6,320,1126,320,1108,320C1089.2,320,1071,320,1052,320C1033.8,320,1015,320,997,320C978.5,320,960,320,942,320C923.1,320,905,320,886,320C867.7,320,849,320,831,320C812.3,320,794,320,775,320C756.9,320,738,320,720,320C701.5,320,683,320,665,320C646.2,320,628,320,609,320C590.8,320,572,320,554,320C535.4,320,517,320,498,320C480,320,462,320,443,320C424.6,320,406,320,388,320C369.2,320,351,320,332,320C313.8,320,295,320,277,320C258.5,320,240,320,222,320C203.1,320,185,320,166,320C147.7,320,129,320,111,320C92.3,320,74,320,55,320C36.9,320,18,320,9,320L0,320Z"
            fillOpacity={1}
          />
        </svg>
      </button>

      {/* Modals */}
      <NormalROIModal
        isOpen={showNormalModal}
        onClose={() => {
          setShowNormalModal(false);
          clearData();
        }}
        data={roiData}
      />

      <BoosterROIModal
        isOpen={showBoosterModal}
        onClose={() => {
          setShowBoosterModal(false);
          clearData();
        }}
        data={roiData}
      />
    </>
  );
};
