import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  Wallet,
  Calendar,
  RefreshCw,
  Check,
  Copy,
  Target,
  Zap,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useOptimizedDashboard } from "../../hooks/useUserDashboard";
import { selectUser } from "../../store/slices/authSlice";
import { useProfile } from "../../hooks/useUserApi";
import { calculatePlanProgress } from "../../utils/percentageCal";
import TradingViewWidget from "../../web/components/TradingViewWidget";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { RoiButton } from "../../components/common/RoiButton";
import Capping from "../../components/features/user/Capping";
const UserDashboard = () => {
  const { data, loading, error, refetch, computed } = useOptimizedDashboard();

  const referral_code = data?.userInfo?.referral_code;
  const [balanceVisible, setBalanceVisible] = useState(true);

  const [isCopied, setIsCopied] = useState(false);
  const registerUrl = `https://www.unimeta.biz/registration?referral=${referral_code}`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(registerUrl)
      .then(() => {
        alert("Referral link copied to clipboard!");
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy referral link: ", err);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const statCards = [
    {
      key: "balance",
      title: "Total Balance",
      value: (visible, computed) =>
        visible ? formatCurrency(computed.totalBalance) : "••••••",
      icon: Wallet,
      bgColor: "from-red-700 to-red-800",
      iconColor: "bg-red-600",
      subtext: (visible, computed) =>
        `Available: ${
          visible ? formatCurrency(computed.availableBalance) : "••••••"
        }`,
      isToggleable: true,
    },
    {
      key: "earnings",
      title: "Today's Earnings",
      value: (_, computed) => formatCurrency(computed.dailyStats.totalEarned),
      icon: TrendingUp,
      iconColor: "bg-green-600",
      bgColor: "from-green-700 to-green-800",
      subtext: () => (
        <span className="text-sm text-green-300  font-semibold flex items-center">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          Daily Performance
        </span>
      ),
    },
    {
      key: "team",
      title: "Team Size",
      value: (_, computed) => formatNumber(computed.teamSummary.totalTeamSize),
      icon: Users,
      iconColor: "bg-purple-600",
      bgColor: "from-purple-700 to-purple-800",
      subtext: (_, computed) => `${computed.teamSummary.activeTeamSize} Active`,
    },
    {
      key: "roi",
      title: "Investment ROI",
      value: (_, computed) =>
        `${(Number(computed.investmentROI) || 0).toFixed(1)}%`,
      icon: Activity,
      iconColor: "bg-yellow-600",
      bgColor: "from-yellow-700 to-yellow-800",
      subtext: () => "Return Rate",
    },
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const { planLimitLeft, progressPercent } = calculatePlanProgress(
    computed?.investmentSummary?.totalInvested,
    Number(data?.userInfo?.total_earned)
  );

  const activeAmount = computed?.investmentSummary.activeAmount;
  const planLimit = 100;

  console.log(data)
  const activeData = [
    {
      name: "Active",
      value: computed?.investmentSummary?.totalEarned,
      fill: "#22c55e",
    },
  ];

  const planData = [
    {
      name: "Limit",
      value: data?.userInfo?.roi_balance,
      fill: "#3b82f6",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!computed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  const balanceData = [
    {
      label: "Main Balance",
      key: "main",
      icon: TrendingUp,
      valueKey: "main",
      color: "#3b82f6",
    },
    {
      label: "ROI Balance",
      key: "roi",
      icon: ShoppingCart,
      valueKey: "roi",
      color: "#22c55e",
    },
    {
      label: "Commission",
      key: "commission",
      icon: BarChart3,
      valueKey: "commission",
      color: "#ef4444",
    },
  ];

  return (
    <div className=" text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-md shadow-sm overflow-hidden h-40 relative"
          >
            <div
              className={`bg-gradient-to-r ${stat.bgColor} px-3 h-20 flex items-start py-3 justify-between`}
            >
              <div
                className={`w-10 h-10 ${stat.iconColor} rounded-md p-2 flex justify-center items-center `}
              >
                <stat.icon className="h-6 w-6 text-red-100" />
              </div>
              <div className="text-right">
                <div className="text-white text-sm font-semibold">
                  {stat.isPositive === true && "+"}
                  {stat.isPositive === false && "-"}
                  {stat.percentage}
                </div>
                <div className="text-gray-100  font-medium text-sm mt-1">
                  {typeof stat.subtext === "function"
                    ? stat.subtext(balanceVisible, computed)
                    : stat.subtext}
                </div>
              </div>
            </div>
            <div className="px-4 py-2 h-24 flex flex-col justify-between relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-[92%] bg-white shadow-md rounded-lg border border-gray-200 p-4 z-10">
                <div className="">
                  <div>
                    <h3 className="text-gray-800 text-base font-medium">
                      {stat.title}
                    </h3>
                  </div>
                  <div className="">
                    <div className="text-xl font-semibold text-gray-900">
                      {stat.value(balanceVisible, computed)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            // {
            //   id: 1,
            //   label: "ROI Earned",
            //   value: computed.stats.totalROI,
            //   icon: TrendingUp,
            //   bgColor: "bg-blue-700",
            //   borderColor: "border-blue-500",
            //   iconColor: "text-blue-500",
            // },
            {
              id: 2,
              label: "Level Income",
              value: computed.stats.totalCommission,
              icon: DollarSign,
              bgColor: "bg-green-700",
              borderColor: "border-green-500",
              iconColor: "text-green-500",
            },
            {
              id: 3,
              label: "Direct Income",
              value: computed.stats.totalDirect,
              icon: Target,
              bgColor: "bg-purple-700",
              borderColor: "border-purple-500",
              iconColor: "text-purple-500",
            },
            {
              id: 4,
              label: "Reward Income",
              value: computed.stats.rewardBonus,
              icon: Calendar,
              bgColor: "bg-orange-700",
              borderColor: "border-orange-500",
              iconColor: "text-orange-500",
            },
            {
              id: 4,
              label: "Upline Income",
              value: computed.stats.totalUpline,
              icon: Calendar,
              bgColor: "bg-orange-700",
              borderColor: "border-orange-500",
              iconColor: "text-orange-500",
            },
            {
              id: 5,
              label: "Deposits",
              value: computed.stats.totalDeposits,
              icon: Target,
              bgColor: "bg-purple-700",
              borderColor: "border-purple-500",
              iconColor: "text-purple-500",
            },
            {
              id: 6,
              label: "Withdrawals",
              value: computed.stats.totalWithdrawals,
              icon: Calendar,
              bgColor: "bg-orange-700",
              borderColor: "border-orange-500",
              iconColor: "text-orange-500",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className={`bg-[#1a1a1a] p-6 border-l-4 ${card.borderColor} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out`}
              >
                <div className="flex items-start justify-between ">
                  <div>
                    <p className="text-base text-gray-300 font-medium tracking-wide mb-1">
                      {card.label}
                    </p>
                    <span className="text-xl font-extrabold text-white tracking-tight">
                      {typeof card.value === "function"
                        ? card.value(computed)
                        : card.value}
                    </span>
                  </div>
                  <div className={`${card.bgColor} rounded-md p-2`}>
                    <Icon className={`w-6 h-6 text-white`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="  ">
          <div className="bg-[#111111] rounded-md shadow-sm border border-[#222] p-4">
            <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
              <div>
                <div className="sm:text-right block sm:hidden mb-4">
                  <p className="text-gray-300 text-sm font-medium">
                    Referred By
                  </p>
                  <div className="flex items-baseline bg-green-900/80 px-3 py-1 rounded-full border border-white/20 justify-end mt-1">
                    <span className="textColor text-sm font-medium">
                      {data?.userInfo?.referred_by || "N/A"}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-xs font-medium">
                  Referral Code
                </p>
                <h1 className="text-white text-sm font-medium mt-1">
                  Your Referral Link
                </h1>
              </div>

              <div className="sm:text-right sm:block hidden">
                <p className="text-gray-300 text-sm font-medium">Referred By</p>
                <div className="flex items-baseline justify-end mt-1">
                  <span className="textColor text-base font-semibold">
                    {data?.userInfo?.referred_by || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute -top-2 left-3 bg-[#1a1a1a] textColor text-xs px-1 rounded">
                  {referral_code}
                </div>

                <input
                  type="text"
                  value={`https://www.unimeta.biz/registration?referral=${referral_code}`}
                  readOnly
                  className="w-full bg-[#1a1a1a] text-white text-sm rounded border border-gray-700 py-2 pl-3 pr-10 focus:outline-none"
                />

                <button
                  onClick={handleCopy}
                  className={`absolute right-2 top-[19px] transform -translate-y-1/2 text-xs rounded px-2 py-1 transition-all duration-300 ${
                    isCopied
                      ? "bg-green-500/10 border border-green-400 text-green-300"
                      : "bg-[#222] text-white hover:bg-teal-600 hover:text-white"
                  }`}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>

                {isCopied && (
                  <p className="text-green-400 text-xs mt-1.5 animate-pulse">
                    Link copied to clipboard!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-[#141414]  rounded-md border border-b-0 border-r border-gray-700 mt-4">
            <div className="flex justify-between items-center p-4 border-b  border-white/20">
              <h3 className="text-xl font-semibold text-white">Stats</h3>
              <div className="text-white cursor-pointer  lg:block hidden">
                <RoiButton />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">
              {[
                {
                  label: "Total Investments",
                  value: (computed) =>
                    computed.investmentSummary.totalInvestments,
                },
                {
                  label: "Active Now",
                  value: (computed) =>
                    computed.investmentSummary.activeInvestments,
                },
                {
                  label: "Total Earned",
                  value: (computed) =>
                    formatCurrency(computed.stats.totalROI),
                },
                {
                  label: "Days Left",
                  value: (computed) =>
                    computed.investmentSummary.averageDaysRemaining,
                },
              ]?.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center bg-[#131312] border-b border-white/20 px-4 py-4 transition ${
                    index % 2 === 0 ? "border-r border-white/20" : ""
                  }`}
                >
                  <span className="text-gray-300 text-base font-medium">
                    {item.label}
                  </span>
                  <span className={`font-semibold text-white text-lg`}>
                    {typeof item.value === "function"
                      ? item.value(computed)
                      : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4 ">
        <div className="lg:col-span-3 col-span-12 grid lg:grid-cols-1 md:grid-cols-4 sm:grid-cols-2 grid-cols-1  gap-4 ">
          {balanceData.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="relative bg-gradient-to-br from-white to-[#efddff] rounded-md p-6 shadow-sm border border-white/50 overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-[125px] h-[125px] bg-no-repeat bg-contain z-0"
                  style={{ backgroundImage: "url('/corner.png')" }}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-medium text-gray-700 tracking-wider mb-1">
                        {card.label}
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: card.color }}
                      >
                        {formatCurrency(
                          computed.balanceBreakdown[card.valueKey]
                        )}
                      </p>
                    </div>

                    <div className="relative">
                      <div
                        className={`rounded-lg p-3 border border-dashed border-opacity-10`}
                        style={{ backgroundColor: `${card.color}1A` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: card.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* <div className="relative bg-gradient-to-br from-white to-[#efddff] rounded-md p-6 shadow-sm border border-white/50 overflow-hidden">
            <div
              className="absolute top-0 right-0 w-[125px] h-[125px] bg-no-repeat bg-contain z-0"
              style={{ backgroundImage: "url('/corner.png')" }}
            ></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-medium text-gray-700 tracking-wider mb-1">
                    Coin
                  </p>
                  <p
                    className="text-2xl font-bold"
                    
                  >
                    1000
                  </p>
                </div>

                <div className="relative">
                  <div
                    className={`rounded-lg p-3 border border-dashed border-opacity-10`}
                  >
                
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="lg:col-span-9 col-span-12 ">
          <TradingViewWidget />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[
          {
            label: "Main Balance",
            icon: TrendingUp,
            key: "main",
            color: "text-blue-400",
            iconBg: "bg-blue-100",
            bgColor: "bg-gradient-to-br from-white to-[#efddff]",
            iconColor: "text-blue-500",
          },
          {
            label: "ROI Balance",
            icon: ShoppingCart,
            key: "roi",
            color: "text-green-400",
            iconBg: "bg-green-100",
            bgColor: "bg-gradient-to-br from-white to-[#efddff]",
            iconColor: "text-green-500",
          },
          {
            label: "Direct + Level + Reward",
            icon: BarChart3,
            iconBg: "bg-red-100",
            iconColor: "text-red-500",
            bgColor: "bg-gradient-to-br from-white to-[#efddff]",
            key: "commission",
            color: "text-red-400",
          },
        ].map((card, index) => {
          const { label, key, color } = card;
          const Icon = card.icon;

          return (
            <div
              key={index}
              className={`relative ${card.bgColor} rounded-md p-6 shadow-sm border border-white/50 overflow-hidden`}
            >
              <div
                className="absolute top-0 right-0 w-[125px] h-[125px] bg-no-repeat bg-contain z-0"
                style={{ backgroundImage: "url('/corner.png')" }}
              ></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-medium text-gray-700 tracking-wider mb-1">
                      {label}
                    </p>
                    <p className={`text-2xl font-bold ${color}`}>
                      {formatCurrency(computed.balanceBreakdown[key])}
                    </p>
                  </div>

                  <div className="relative">
                    <div
                      className={`${
                        card.iconBg
                      } rounded-lg p-3 border border-dashed ${card.iconColor.replace(
                        "text-",
                        "border-"
                      )} border-opacity-10`}
                    >
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div> */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative bg-[#131312] rounded-md border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <span className="text-gray-300 font-sm font-medium">
                    Active Investment
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">
                      Portfolio Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-medium text-white">
                  ${activeAmount.toFixed(2)}
                </span>
                <div className="text-sm text-green-400 ">+12.5% this month</div>
              </div>
            </div>
            <div className="p-4">
              <div className="relative flex justify-center items-center h-48">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-full"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="90%"
                    data={activeData}
                    startAngle={90}
                    endAngle={450}
                  >
                    <defs>
                      <linearGradient
                        id="activeGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <PolarAngleAxis
                      type="number"
                      domain={[0, planLimit]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "#374151", opacity: 0.3 }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white mb-1">
                      ${computed.investmentSummary.totalEarned}
                    </div>
                    <div className="text-sm text-gray-300">of limit used</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative bg-[#131312] rounded-md border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-gray-300 text-sm font-medium">
                    ROI Limit
                  </span>
                  <div className="flex items-center space-x-2 ">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400">Real-time</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-medium text-white">
                  {planLimitLeft.toFixed(2)}%
                </span>
                {/* <div className="text-sm text-blue-300 ">Available</div> */}
              </div>
            </div>
            <div className="p-4">
              <div className="relative  flex justify-center items-center h-48">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full"></div>
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
                        {/* <stop offset="0%" stopColor="#3b82f6" /> */}
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "#374151", opacity: 0.3 }}
                      dataKey="value"
                      cornerRadius={8}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-white">
                      {planLimitLeft.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-300">ROI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       <Capping/>
      </div>
      <div className="bg-gray-800 rounded-md  border border-gray-700">
        <h3 className="text-xl font-semibold text-white p-4 ">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white">
            <thead className="bg-[#1a1a1a]">
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Type</th>
                <th className="text-left py-3 px-4 text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300">Date</th>
                <th className="text-left py-3 px-4 text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {data.recentTransactions
                .slice(0, 5)
                .filter((tr) => tr.transaction_type === "deposit")
                .map((transaction, index) => (
                  <tr
                    key={index}
                    className=" last:border-b-0 border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.transaction_type === "roi_earning"
                            ? "bg-green-900 text-green-300"
                            : transaction.transaction_type ===
                              "level_commission"
                            ? "bg-purple-900 text-purple-300"
                            : transaction.transaction_type === "direct_bonus"
                            ? "bg-yellow-900 text-green-300"
                            : transaction.transaction_type === "withdrawal"
                            ? "bg-red-900 text-red-300"
                            : "bg-blue-900 text-blue-300"
                        }`}
                      >
                        {transaction.transaction_type
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(parseFloat(transaction.net_amount))}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
