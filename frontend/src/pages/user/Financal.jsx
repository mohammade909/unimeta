import React from "react";
import {
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  PiggyBank,
  Target,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useTransactionStats } from "../../hooks/useTransactions";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";

const Financial = () => {
  const user = useSelector(selectUser);
  
  const { stats } = useTransactionStats({ user_id: user?.id });

   const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor, isCurrency = true }) => (
    <div className={`${bgColor} rounded-md shadow-md p-4 border border-white border-opacity-20 hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-200">
            {isCurrency ? formatCurrency(value) : value}
          </p>
          <p className="text-base font-medium text-yellow-500">{title}</p>
        </div>
      </div>
    </div>
  );

  const TransactionStatusCard = ({ title, count, color, bgColor, icon: Icon }) => (
    <div className={`${bgColor} rounded-lg p-4 border border-white border-opacity-20 flex items-center space-x-3`}>
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-semibold text-green-300">{count}</p>
        <p className="text-base font-medium text-gray-200">{title}</p>
      </div>
    </div>
  );

  // Calculate totals
  const totalEarnings =
    parseFloat(stats?.total_roi_earning || 0) +
    parseFloat(stats?.total_level_commission || 0) +
    parseFloat(stats?.total_direct_bonus || 0) +
    parseFloat(stats?.total_reward_bonus || 0);

  const netBalance =
    parseFloat(stats?.total_deposit || 0) +
    totalEarnings -
    parseFloat(stats?.total_withdrawal || 0) -
    parseFloat(stats?.total_transfer_out || 0) -
    parseFloat(stats?.total_invest || 0);

  // Calculate success rate
  const successRate = parseFloat(stats?.total_transactions || 0) > 0 
    ? ((parseFloat(stats?.completed_transactions || 0) / parseFloat(stats?.total_transactions || 0)) * 100).toFixed(1)
    : 0;

  // Calculate ROI percentage
  const roiPercentage = parseFloat(stats?.total_invest || 0) > 0 
    ? ((totalEarnings / parseFloat(stats?.total_invest || 0)) * 100).toFixed(2)
    : 0;

  return (
    <div className="bg-gray-900 rounded-md min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b p-4 border-white border-opacity-20">
          <h1 className="text-2xl font-semibold text-green-300">
            Financial Dashboard
          </h1>
          <p className="text-gray-300">
            Complete overview of your financial activities
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <StatCard
            title="Total Deposits"
            value={stats?.total_deposit || 0}
            icon={ArrowDownRight}
            color="bg-green-800"
            bgColor="bg-green-900"
          />
          <StatCard
            title="Total Investments"
            value={stats?.total_invest || 0}
            icon={PiggyBank}
            color="bg-blue-800"
            bgColor="bg-blue-900"
          />
          <StatCard
            title="Total Earnings"
            value={totalEarnings}
            icon={TrendingUp}
            color="bg-purple-800"
            bgColor="bg-purple-900"
          />
          <StatCard
            title="Net Balance"
            value={netBalance}
            icon={DollarSign}
            color="bg-indigo-800"
            bgColor="bg-indigo-900"
          />
        </div>

        {/* Earnings Breakdown */}
        <div className="px-4">
          <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-md">
            <h2 className="text-2xl font-bold text-green-300 p-4 border-b border-white border-opacity-20 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
              Earnings Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                <p className="text-lg font-semibold text-green-100">ROI Earnings</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.total_roi_earning || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                <p className="text-lg font-semibold text-blue-100">Level Commission</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.total_level_commission || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                <p className="text-lg font-semibold text-purple-100">Direct Bonus</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.total_direct_bonus || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
                <p className="text-lg font-semibold text-orange-100">Reward Bonus</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.total_reward_bonus || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Transaction Status */}
          <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-md">
            <h3 className="text-xl font-bold text-green-300 p-4 border-b border-white border-opacity-20 flex items-center">
              <span className="bg-blue-900 p-2 rounded-md mr-2">
                <Target className="w-5 h-5 text-blue-500" />
              </span>
              Transaction Status
            </h3>
            <div className="space-y-4 p-4">
              <TransactionStatusCard
                title="Completed"
                count={stats?.completed_transactions || 0}
                color="bg-green-800"
                bgColor="bg-green-900"
                icon={CheckCircle}
              />
              <TransactionStatusCard
                title="Pending"
                count={stats?.pending_transactions || 0}
                color="bg-yellow-800"
                bgColor="bg-yellow-900"
                icon={Clock}
              />
              <TransactionStatusCard
                title="Failed"
                count={stats?.failed_transactions || 0}
                color="bg-red-800"
                bgColor="bg-red-900"
                icon={XCircle}
              />
            </div>
          </div>

          {/* Transfers & Others */}
          <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-md">
            <h3 className="text-xl font-bold text-green-300 p-4 border-b border-white border-opacity-20 flex items-center">
              <span className="bg-purple-900 p-2 rounded-md mr-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
              </span>
              Transfers & Others
            </h3>
            <div className="">
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Transfer In</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats?.total_transfer_in || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Transfer Out</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats?.total_transfer_out || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Total Withdrawal</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats?.total_withdrawal || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Top Up</span>
                <span className="font-semibold text-white">
                  {formatCurrency(stats?.total_topup || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Compound</span>
                <span className="font-semibold text-white">
                  {formatCurrency(stats?.total_compound || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 border-b border-white border-opacity-10">
                <span className="text-gray-200">Penalty</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats?.total_penalty || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5">
                <span className="text-gray-200">Refund</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats?.total_refund || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="px-4 pb-4">
          <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-sm">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 p-4 border-b border-white border-opacity-20">
              Summary Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-400">
                  {stats?.total_transactions || 0}
                </div>
                <div className="text-gray-200">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {successRate}%
                </div>
                <div className="text-gray-200">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-purple-600">
                  {roiPercentage}%
                </div>
                <div className="text-gray-200">ROI Percentage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;