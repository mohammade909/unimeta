import React, { useEffect } from "react";
import { useUserInvestments } from "../../hooks/useInvestment";
import { Table } from "../../components/common/Tables";
import Loading from "../../components/common/Loading"; // Assuming the table component is in the same directory
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  PieChart,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  PauseCircle,
  Loader2,
} from "lucide-react";

const Investments = () => {
  const {
    loading,
    userInvestments,
    investmentSummary,
    refresh,
    error,
    actions,
  } = useUserInvestments({ autoFetch: true });


  // Define table columns
  const columns = [
    {
      key: "plan_name",
      label: "Plan Name",
      render: (value) => (
        <div className="font-medium text-gray-100">{value}</div>
      ),
    },
    {
      key: "invested_amount",
      label: "Invested Amount",
      render: (value) => (
        <div className="font-semibold text-yellow-600">
          ${parseFloat(value).toLocaleString()}
        </div>
      ),
    },
    {
      key: "current_value",
      label: "Current Value",
      render: (value) => (
        <div className="font-semibold text-blue-600">
          ${parseFloat(value).toLocaleString()}
        </div>
      ),
    },
    {
      key: "total_earned",
      label: "Total Earned",
      render: (value) => (
        <div
          className={`font-semibold ${
            parseFloat(value) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${parseFloat(value).toLocaleString()}
        </div>
      ),
    },
    {
      key: "daily_roi_percentage",
      label: "Daily ROI",
      render: (value) => (
        <div className="text-purple-600 font-medium">
          {parseFloat(value).toFixed(2)}%
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const statusConfig = {
          active: {
            icon: CheckCircle,
            color: "text-green-600 bg-green-50",
            label: "Active",
          },
          completed: {
            icon: CheckCircle,
            color: "text-blue-600 bg-blue-50",
            label: "Completed",
          },
          cancelled: {
            icon: XCircle,
            color: "text-red-600 bg-red-50",
            label: "Cancelled",
          },
          paused: {
            icon: PauseCircle,
            color: "text-yellow-600 bg-yellow-50",
            label: "Paused",
          },
        };

        const config = statusConfig[value] || {
          icon: AlertCircle,
          color: "text-gray-600 bg-gray-50",
          label: value,
        };
        const Icon = config.icon;

        return (
          <div
            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${config.color}`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </div>
        );
      },
    },
    {
      key: "start_date",
      label: "Start Date",
      render: (value) => (
        <div className="text-gray-200">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "end_date",
      label: "End Date",
      render: (value) => (
        <div className="text-gray-200">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Investments",
      value: investmentSummary?.total_investments || "0",
      icon: PieChart,
      color: "text-blue-600 bg-blue-800",
      bgColor: "bg-blue-900",
      change: null,
    },
    {
      title: "Total Invested",
      value: `$${parseFloat(
        investmentSummary?.total_invested || 0
      ).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-800",
      bgColor: "bg-green-900",
      change: null,
    },
    {
      title: "Current Value",
      value: `$${parseFloat(
        investmentSummary?.total_current_value || 0
      ).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-800",
      bgColor: "bg-purple-900",
      change: null,
    },
    {
      title: "Total Earned",
      value: `$${parseFloat(
        investmentSummary?.total_earned || 0
      ).toLocaleString()}`,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-800",
      bgColor: "bg-emerald-900",
      change: null,
    },
  ];



  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700 font-medium">
              Error loading investments
            </p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-4 bg-[#1e1e1e] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/20">
        <div>
          <h1 className="text-2xl font-semibold text-green-400">
            Investment Dashboard
          </h1>
          <p className="text-gray-200 text-base">
            Monitor and manage your investment portfolio
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 font-medium text-white rounded-md transition-colors flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={` ${card.bgColor} rounded-xl p-6 shadow-sm border border-white/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-green-300">
                    {card.title}
                  </p>
                  <p className="text-xl font-semibold text-gray-200 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Overview */}
   
      {/* Investments Table */}
      <div className="px-4 pb-4">
      <div className="bg-[#2d2d2dde] rounded-md shadow-sm border border-white/20 mb-4">
        <div className="p-4 ">
          <h3 className="text-lg font-semibold text-green-300">
            Your Investments
          </h3>
          <p className="text-gray-200">
            Detailed view of all your investment activities
          </p>
        </div>

        {!userInvestments || userInvestments.length === 0 ? (
          <div className="p-12 text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No investments found
            </h4>
            <p className="text-gray-600">
              Start your investment journey by creating your first investment
              plan.
            </p>
          </div>
        ) : (
          <Table
            data={userInvestments}
            columns={columns}
            pageSize={10}
            searchable={true}
            dateFilterable={true}
            className="border-0 shadow-none"
          />
        )}
      </div>
    

      {/* Average ROI Display */}
      {investmentSummary?.avg_roi_percentage &&
        parseFloat(investmentSummary.avg_roi_percentage) > 0 && (
          <div className="bg-[#2d2d2dde] rounded-md shadow-md p-4 ">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-800 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-300">
                  Average ROI Performance
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {parseFloat(investmentSummary.avg_roi_percentage).toFixed(4)}%
                </p>
              </div>
            </div>
          </div>
        )}
          </div>
    </div>
  );
};

export default Investments;
