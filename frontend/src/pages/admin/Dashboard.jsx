import React, { useState } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  PieChart,
  Calendar,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDashboardData } from "../../hooks/useStats";

const Dashboard = () => {
  const { data: dashboardData } = useDashboardData();
  const [activeTab, setActiveTab] = useState("overview");

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-[var(--grid-bg-1)]",
      green: "bg-[var(--grid-bg-2)]",
      purple: "bg-[var(--grid-bg-3)]",
      red: "bg-[var(--grid-bg-4)]",
    };

    const iconBgClasses = {
      blue: "bg-[var(--icon-bg-1)]",
      green: "bg-[var(--icon-bg-2)]",
      purple: "bg-[var(--icon-bg-3)]",
      red: "bg-[var(--icon-bg-4)]",
    };

    return (
      <div
        className={`p-4 rounded-xl border border-white/10 shadow-md text-white ${colorClasses[color]} bg-opacity-90 backdrop-blur-sm transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-2 rounded-full ${iconBgClasses[color]} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-semibold ${
                trend === "up" ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <h3
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--title-color)" }}
        >
          {value} 
        </h3>
        <p
          className="text-base font-semibold"
          style={{ color: "var(--subtitle-color)" }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            className="text-sm mt-1 opacity-90"
            style={{ color: "var(--desc-color)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  };

  const TransactionTypeCard = ({ type, count, amount, avgAmount }) => {
    const getTypeColor = (type) => {
      const colors = {
        deposit: "bg-[var(--grid-bg-1)] text-[var(--desc-color)]",
        invest: "bg-[var(--grid-bg-2)] text-[var(--desc-color)]",
        withdrawal: "bg-[var(--grid-bg-3)] text-[var(--desc-color)]",
        level_commission: "bg-[var(--grid-bg-4)] text-[var(--desc-color)]",
        bonus: "bg-[var(--grid-bg-5)] text-[var(--desc-color)]",
        rebate: "bg-[var(--grid-bg-6)] text-[var(--desc-color)]",
        cashback: "bg-[var(--grid-bg-7)] text-[var(--desc-color)]",
        fee: "bg-[var(--grid-bg-8)] text-[var(--desc-color)]",
      };
      return colors[type] || "bg-[var(--grid-bg-1)] text-[var(--desc-color)]";
    };

    return (
      <div className="p-4 rounded-lg border border-white/20 shadow-sm bg-[var(--grid-bg)]">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
              type
            )}`}
          >
            {type.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-sm" style={{ color: "var(--subtitle-color)" }}>
            {count} transactions
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-[var(--title-color)]">
            ${amount}
          </div>
          <div className="text-sm" style={{ color: "var(--subtitle-color)" }}>
            Avg: ${avgAmount}
          </div>
        </div>
      </div>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      const icons = {
        withdrawal: (
          <ArrowDownRight className="w-4 h-4 text-[var(--danger-color)]" />
        ),
        investment: (
          <TrendingUp className="w-4 h-4 text-[var(--primary-color)]" />
        ),
        user_registration: (
          <Users className="w-4 h-4 text-[var(--success-color)]" />
        ),
        deposit: (
          <ArrowUpRight className="w-4 h-4 text-[var(--success-color)]" />
        ),
      };
      return (
        icons[type] || <Activity className="w-4 h-4 text-[var(--desc-color)]" />
      );
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    return (
      <div className="flex items-center p-3 rounded-lg border shadow-sm bg-[var(--bg-inner)] border-[var(--border-color)]">
        <div className="flex-shrink-0 mr-3 text-[var(--subtitle-color)]">
          {getActivityIcon(activity.activity_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate text-[var(--subtitle-color)]">
              {activity.full_name} ({activity.username})
            </p>
            {activity.amount && (
              <p className="text-sm font-semibold text-[var(--text-color)]">
                ${activity.amount}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs capitalize text-[var(--desc-color)]">
              {activity.activity_type.replace("_", " ")}
            </p>
            <p className="text-xs text-[var(--desc-color)]">
              {formatTime(activity.activity_time)}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive ? "shadow-lg" : "hover:opacity-80"
      }`}
      style={{
        backgroundColor: isActive
          ? "var(--tab-bg-active)"
          : "var(--tab-bg-inactive)",
        color: isActive ? "var(--tab-text-active)" : "var(--tab-text-inactive)",
      }}
    >
      {label}
    </button>
  );

  if (!dashboardData) {
    return null;
  }
  return (
    <div className="min-h-screen bg-[var(--bg-inner)] rounded-md">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <h1 className="text-2xl font-semibold text-[var(--title-color)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--subtitle-color)]">
            Monitor and manage your platform's performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-4">
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={setActiveTab}
          />
          <TabButton
            id="users"
            label="Users"
            isActive={activeTab === "users"}
            onClick={setActiveTab}
          />
          <TabButton
            id="transactions"
            label="Transactions"
            isActive={activeTab === "transactions"}
            onClick={setActiveTab}
          />
          <TabButton
            id="investments"
            label="Investments"
            isActive={activeTab === "investments"}
            onClick={setActiveTab}
          />
          <TabButton
            id="withdrawals"
            label="Withdrawals"
            isActive={activeTab === "withdrawals"}
            onClick={setActiveTab}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={dashboardData.users.basic.total_users}
                subtitle="All registered users"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total Volume"
                value={`$${Number(
                  dashboardData.transactions.basic.total_volume
                ).toFixed(2)}`}
                subtitle="All transactions"
                icon={DollarSign}
                color="red"
              />
              <StatCard
                title="Active Investments"
                value={`$${Number(
                  dashboardData.investments.basic.active_investments
                ).toFixed(2)}`}
                subtitle="Currently invested"
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                title="Completed Withdrawals"
                value={`$${Number(
                  dashboardData.withdrawals.basic.completed_amount
                ).toFixed(2)}`}
                subtitle="Successfully processed"
                icon={ArrowDownRight}
                color="green"
              />
            </div>

            <div className="bg-[var(--bg-inner)] text-[var(--subtitle-color)] rounded-md shadow-md">
              <h2 className="text-2xl font-bold text-[var(--title-color)] mb-6 p-4 border-b border-white/20 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-[var(--icon-bg-5)]" />
                Recent Activity
              </h2>
              <div className="space-y-3 p-4">
                {dashboardData.recentActivity
                  .slice(0, 6)
                  .map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Users"
                value={dashboardData.users.basic.active_users}
                subtitle="Currently active"
                icon={UserCheck}
                color="green"
              />
              <StatCard
                title="Inactive Users"
                value={dashboardData.users.basic.inactive_users}
                subtitle="Not active"
                icon={UserX}
                color="red"
              />
              <StatCard
                title="Week Registrations"
                value={dashboardData.users.basic.week_registrations}
                subtitle="This week"
                icon={Calendar}
                color="blue"
              />
              <StatCard
                title="Email Verified"
                value={dashboardData.users.verification.email_verified}
                subtitle={`Out of ${dashboardData.users.basic.total_users}`}
                icon={Shield}
                color="purple"
              />
            </div>

            <div className="bg-[var(--bg-inner)] rounded-md  shadow-md">
              <h2 className="text-2xl font-bold text-[var(--title-color)]  border-b border-white/20 p-4">
                User Roles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {dashboardData.users.roles.map((role, index) => {
                  const gridBgVar = `var(--grid-bg-${(index % 4) + 1})`; // cycle 1 to 4
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: gridBgVar }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white capitalize">
                          {role.role}
                        </span>
                        <span className="text-2xl font-bold text-white">
                          {role.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[var(--bg-inner)] rounded-md shadow-md   mt-4">
              <h2 className="text-2xl font-semibold text-[var(--title-color)] border-b border-white/20 p-4">
                Monthly Growth
              </h2>
              <div className="space-y-4 p-4">
                {dashboardData.users.monthlyGrowth.map((month, index) => {
                  const gridBgVar = `var(--grid-bg-${(index % 4) + 1})`;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: gridBgVar }}
                    >
                      <span className="text-white">{month.month}</span>
                      <span className="text-lg font-semibold text-white">
                        +{month.registrations} users
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-4 px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Transactions"
                value={dashboardData.transactions.basic.total_transactions}
                subtitle="All time"
                icon={CreditCard}
                color="blue"
              />
              <StatCard
                title="Completed Volume"
                value={`$${dashboardData.transactions.basic.completed_volume}`}
                subtitle="Successfully processed"
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Week Volume"
                value={`$${dashboardData.transactions.basic.week_volume}`}
                subtitle="This week"
                icon={Calendar}
                color="purple"
              />
              <StatCard
                title="Failed Volume"
                value={`$${dashboardData.transactions.basic.failed_volume}`}
                subtitle="Failed transactions"
                icon={XCircle}
                color="red"
              />
            </div>

            <div className="bg-[var(--bg-inner)] rounded-md shadow-md ">
              <h2 className="text-2xl font-bold text-[var(--title-color)] p-4 border-b border-white/20">
                Transaction Types
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {dashboardData.transactions.byType.map((type, index) => (
                  <TransactionTypeCard
                    key={index}
                    type={type.transaction_type}
                    count={type.count}
                    amount={type.total_amount}
                    avgAmount={type.avg_amount}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === "investments" && (
          <div className="space-y-4 px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Investments"
                value={dashboardData.investments.basic.total_investments}
                subtitle="Active investments"
                icon={TrendingUp}
                color="blue"
              />
              <StatCard
                title="Total Invested"
                value={`$${dashboardData.investments.basic.total_invested}`}
                subtitle="Principal amount"
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Total Earned"
                value={`$${dashboardData.investments.basic.total_earned}`}
                subtitle="ROI earnings"
                icon={ArrowUpRight}
                color="purple"
              />
              <StatCard
                title="Current Value"
                value={`$${dashboardData.investments.basic.current_value}`}
                subtitle="Principal + earnings"
                icon={PieChart}
                color="red"
              />
            </div>

            {dashboardData.investments.byPlan.map((plan, index) => {
              const bgColors = [
                "var(--grid-bg-1)",
                "var(--grid-bg-2)",
                "var(--grid-bg-3)",
                "var(--grid-bg-4)",
              ];
              const bgColor = bgColors[index % bgColors.length];

              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-[var(--border-color)]"
                  style={{
                    backgroundColor: `var(--card-inner-bg)`,
                    backgroundImage: `linear-gradient(to bottom right, ${bgColor}, rgba(255,255,255,0.05))`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[var(--title-color)]">
                      {plan.plan_name}
                    </h3>
                    <span className="text-sm text-[var(--subtitle-color)]">
                      {plan.investment_count} investments
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-[var(--subtitle-color)]">
                        Total Invested
                      </p>
                      <p className="text-2xl font-bold text-[var(--title-color)]">
                        ${plan.total_invested}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--subtitle-color)]">
                        Total Earned
                      </p>
                      <p className="text-2xl font-bold text-green-500">
                        ${plan.total_earned}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--subtitle-color)]">
                        Average Amount
                      </p>
                      <p className="text-2xl font-bold text-purple-500">
                        ${plan.avg_amount}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Requests"
                value={dashboardData.withdrawals.basic.total_requests}
                subtitle="All withdrawal requests"
                icon={ArrowDownRight}
                color="blue"
              />
              <StatCard
                title="Completed Amount"
                value={`$${dashboardData.withdrawals.basic.completed_amount}`}
                subtitle="Successfully processed"
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Rejected Amount"
                value={`$${dashboardData.withdrawals.basic.rejected_amount}`}
                subtitle="Rejected requests"
                icon={XCircle}
                color="red"
              />
              <StatCard
                title="Total Fees"
                value={`$${dashboardData.withdrawals.basic.total_fees}`}
                subtitle="Processing fees"
                icon={DollarSign}
                color="purple"
              />
            </div>

            <div className="bg-[var(--bg-inner)] rounded-md shadow-md ">
              <h2 className="text-2xl font-semibold text-[var(--title-color)] p-4 border-b border-white/20">
                Withdrawal Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {dashboardData.withdrawals.byStatus.map((status, index) => {
                  const bgColors = [
                    "var(--grid-bg-1)",
                    "var(--grid-bg-3)",
                    "var(--grid-bg-4)",
                  ];
                  const bgColor = bgColors[index % bgColors.length];

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            status.status === "completed"
                              ? "bg-green-400/10 text-green-400"
                              : status.status === "rejected"
                              ? "bg-red-200/10 text-red-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {status.status.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-[var(--subtitle-color)]">
                          {status.count} requests
                        </span>
                      </div>
                      <div className="text-xl font-semibold text-[var(--title-color)]">
                        ${status.total_amount}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
