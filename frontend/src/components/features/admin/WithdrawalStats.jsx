import {
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { useAdminWithdrawals } from "../../../hooks/useWithdrawals";

export default function WithdrawalStats() {
  const { statistics } = useAdminWithdrawals();
  // Sample data - replace with your actual data
  const stats = statistics;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgGradient,
    subtitle,
  }) => (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div
        className={`relative bg-gradient-to-br ${bgGradient} rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">{title}</p>
            <p
              className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {value||0.00}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${color
              .replace("from-", "from-")
              .replace("to-", "to-")} bg-opacity-20 backdrop-blur-sm`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const SectionCard = ({
    title,
    data,
    icon: Icon,
    color,
    bgGradient,
    borderColor,
  }) => (
    <div className="relative group">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${borderColor} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
      ></div>
      <div
        className={`relative bg-gradient-to-br ${bgGradient} rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-20`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-xl text-white">{title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Transactions</p>
            <p
              className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {data.count || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Amount</p>
            <p
              className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {formatCurrency(data.amount|| 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Fees</p>
            <p
              className={`text-lg font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {formatCurrency(data.fees || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Net Amount</p>
            <p
              className={`text-lg font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {formatCurrency(data.net_amount || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
  

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Transactions"
            value={stats.total_count ||0}
            icon={Users}
            color="from-cyan-400 to-blue-500"
            bgGradient="from-gray-800/50 to-gray-900/50"
            subtitle="All withdrawals"
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(stats.total_amount ||0)}
            icon={DollarSign}
            color="from-emerald-400 to-green-500"
            bgGradient="from-gray-800/50 to-gray-900/50"
            subtitle="Gross withdrawals"
          />
          <StatCard
            title="Total Fees"
            value={formatCurrency(stats.total_fees ||0)}
            icon={CreditCard}
            color="from-rose-400 to-red-500"
            bgGradient="from-gray-800/50 to-gray-900/50"
            subtitle="Processing fees"
          />
          <StatCard
            title="Net Amount"
            value={formatCurrency(stats.total_net_amount ||0)}
            icon={TrendingUp}
            color="from-violet-400 to-purple-500"
            bgGradient="from-gray-800/50 to-gray-900/50"
            subtitle="After fees"
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Pending Transactions */}
          <SectionCard
            title="Pending Transactions"
            data={{
              count: stats.pending_count ||0,
              amount: stats.pending_amount ||0,
              fees: stats.pending_fees ||0,
              net_amount: stats.pending_net_amount ||0  ,
            }}
            icon={Clock}
            color="from-amber-400 to-orange-500"
            bgGradient="from-amber-900/20 to-orange-900/20"
            borderColor="from-amber-500 to-orange-500"
          />

          {/* Completed Transactions */}
          <SectionCard
            title="Completed Transactions"
            data={{
              count: stats.completed_count,
              amount: stats.completed_amount,
              fees: stats.completed_fees,
              net_amount: stats.completed_net_amount,
            }}
            icon={CheckCircle}
            color="from-emerald-400 to-green-500"
            bgGradient="from-emerald-900/20 to-green-900/20"
            borderColor="from-emerald-500 to-green-500"
          />
        </div>

        {/* Summary Insights */}
        {/* <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-500/20">
                <p className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stats.total_count > 0 ? ((stats.pending_count / stats.total_count) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-gray-300 font-medium">Pending Rate</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-900/30 to-green-800/30 rounded-xl border border-emerald-500/20">
                <p className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
                  {stats.total_amount > 0 ? ((stats.total_fees / stats.total_amount) * 100).toFixed(2) : 0}%
                </p>
                <p className="text-gray-300 font-medium">Fee Percentage</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-violet-800/30 rounded-xl border border-purple-500/20">
                <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-2">
                  {formatCurrency(stats.total_count > 0 ? stats.total_amount / stats.total_count : 0)}
                </p>
                <p className="text-gray-300 font-medium">Average Transaction</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>

        {/* <style jsx>{`
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style> */}
    </div>
  );
}
