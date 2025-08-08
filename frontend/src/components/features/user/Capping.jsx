import { Shield, Zap } from "lucide-react";
import React from "react";
import { PolarAngleAxis, RadialBarChart, ResponsiveContainer, RadialBar } from "recharts";
import { useUserLimit } from "../../../hooks/useTransactions";

const calculatePlanProgress = (limit, earnings) => {
  if (!limit || limit === 0) {
    return { progressPercent: 0, planLimitLeft: 0 };
  }

  const usedPercent = (earnings / limit) * 100;
  const remainingPercent = 100 - usedPercent;

  return {
    progressPercent: Math.min(usedPercent, 100), // Cap at 100%
    planLimitLeft: Math.max(remainingPercent, 0), // Ensure not negative
  };
};

const Capping = () => {
  const { limit, loading } = useUserLimit();

  const { planLimitLeft, progressPercent } = calculatePlanProgress(
    limit?.dailyLimit,
    Number(limit?.dailyEarnings || 0) 
  );
  console.log(limit);
  

  const planData = [
    {
      name: "Used",
      value: progressPercent,
      fill: "url(#limitGradient)",
    },
  ];

  if (loading) {
    return (
      <div className="group relative overflow-hidden">
        <div className="relative bg-[#131312] rounded-md border border-gray-700/50 backdrop-blur-sm">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      <div className="relative bg-[#131312] rounded-md border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-1 bg-purple-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-gray-300 text-sm font-medium">
                Daily Capping
              </span>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400">Real-time</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-medium text-white">
              {planLimitLeft.toFixed(2)}%
            </span>
            <div className="text-sm text-purple-300">Remaining</div>
          </div>
        </div>
        <div className="p-4">
          <div className="relative flex justify-center items-center h-48">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-full"></div>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="90%"
                data={planData}
                startAngle={90}
                endAngle={450}
              >
                <defs>
                  <linearGradient
                    id="limitGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#7e22ce" />
                  </linearGradient>
                </defs>
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: "#374151", opacity: 0.3 }}
                  dataKey="value"
                  cornerRadius={8}
                  fill="url(#limitGradient)"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {progressPercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mb-1">used</div>
                <div className="text-lg font-semibold text-purple-400">
                  {planLimitLeft.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>
          </div>
          
          {/* Additional info */}
          {/* <div className="mt-4 flex justify-between text-sm">
            <div className="text-gray-400">
              Earnings: <span className="text-white">{limit?.dailyEarnings || 0}</span>
            </div>
            <div className="text-gray-400">
              Limit: <span className="text-white">{limit?.dailyLimit || 0}</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Capping;