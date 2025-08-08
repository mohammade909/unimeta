import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  Eye,
} from "lucide-react";
import { Table } from "../../components/common/Tables";
import { useSearchParams } from "react-router-dom";
import { useUserTransactions } from "../../hooks/useTransactions";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/authSlice";
import CommissionBreakdown from "../../components/features/shared/CommissionBreakdown";
// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "bg-green-800", text: "text-green-100", icon: Check };
      case "pending":
        return {
          bg: "bg-yellow-800",
          text: "text-yellow-100",
          icon: AlertCircle,
        };
      case "failed":
        return { bg: "bg-red-800", text: "text-red-100", icon: X };
      default:
        return { bg: "bg-gray-800", text: "text-gray-100", icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

// Transaction Type Badge Component
const TransactionTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case "invest":
        return { bg: "bg-blue-800", text: "text-blue-100", icon: TrendingUp };
      case "roi_earning":
        return { bg: "bg-green-800", text: "text-green-100", icon: DollarSign };
      case "direct_bonus":
        return { bg: "bg-purple-800", text: "text-purple-100", icon: Users };
      case "level_commission":
        return { bg: "bg-orange-800", text: "text-orange-100", icon: Activity };
      case "transfer_in":
        return {
          bg: "bg-indigo-800",
          text: "text-indigo-100",
          icon: DollarSign,
        };
      default:
        return { bg: "bg-gray-800", text: "text-gray-100", icon: Activity };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {type?.replace("_", " ")}
    </span>
  );
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format amount helper
export const formatAmount = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(parseFloat(amount));
};
// Main Transaction Dashboard Component
const Transactions = () => {
  const [searchParams] = useSearchParams();
  const user = useSelector(selectUser);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const transaction_type = searchParams.get("transactionType");
  const { transactions, setFilters } = useUserTransactions({
    userId: user.id,
    transaction_type,
  });


  // Helper function to safely parse source_details
const parseSourceDetails = (sourceDetails) => {
  try {
    return typeof sourceDetails === "string" 
      ? JSON.parse(sourceDetails) 
      : sourceDetails || {};
  } catch (error) {
    console.error("Invalid JSON in source_details:", sourceDetails);
    return {};
  }
};

// Check if any transaction has booster applied
const hasBoosterTransactions = useMemo(() => {
  if (transaction_type !== "roi_earning") return false;

  return transactions.some((transaction) => {
    const sourceDetails = parseSourceDetails(transaction.source_details);
    return sourceDetails.boost_applied === true;
  });
}, [transactions, transaction_type]);

// Base columns that are always present
const baseColumns = [
  {
    key: "index",
    label: "S.No",
    render: (_value, _row, index) => `#${Number(index) + 1}`,
  },
  {
    key: "transaction_type",
    label: "Type",
    render: (value) => <TransactionTypeBadge type={value} />,
  },
  {
    key: "amount",
    label: "Amount",
    render: (value, row) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          {formatAmount(value, row.currency)}
        </span>
        {parseFloat(row.fee_amount) > 0 && (
          <span className="text-xs text-gray-500">
            Fee: {formatAmount(row.fee_amount, row.currency)}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "created_at",
    label: "Date",
    render: (value) => formatDate(value),
  },
];

// Conditional columns
const conditionalColumns = [];

// Add Trade Result column for ROI earnings
if (transaction_type === "roi_earning") {
  conditionalColumns.push({
    key: "trade_result",
    label: "Trade",
    render: (_value, row) => {
      const parsedDetails = parseSourceDetails(row.source_details);
      const result = parsedDetails.trade_result;

      if (!result) return <span className="text-gray-400">-</span>;

      const isProfit = result === "profit";
      const color = isProfit ? "text-green-500" : "text-red-500";

      return (
        <span className={`font-semibold capitalize ${color}`}>{result}</span>
      );
    },
  });
}

// Add Details column for ROI earnings
if (transaction_type === "roi_earning") {
  conditionalColumns.push({
    key: "source_details",
    label: "Details",
    render: (value, row) => {
      const parsedValue = parseSourceDetails(value);

      return (
        <div className="flex flex-col">
          <div className="font-xs">
            <span> {parsedValue.daily_roi_percentage}% </span>
            {parsedValue.boost_applied && (
              <span className="text-green-400">
                +{parsedValue.boosted_roi_percentage}%
              </span>
            )}
          </div>
          <span className="text-xs text-green-500">
            ${parsedValue.invested_amount}
          </span>
          <span className="text-xs text-gray-500">
            {parsedValue.plan_name}
          </span>
        </div>
      );
    },
  });
}

// Add Booster column only if there are booster transactions
if (hasBoosterTransactions && transaction_type === "roi_earning") {
  conditionalColumns.push({
    key: "booster_details",
    label: "Booster",
    render: (value, row) => {
      const parsedValue = parseSourceDetails(row.source_details);

      // If no boost applied, show dash
      if (!parsedValue.boost_applied) {
        return <span className="text-gray-400">-</span>;
      }

      return (
        <div className="flex flex-col">
          <div className="flex items-center text-yellow-700 mb-1">
            <span className="text-xs font-semibold">🚀 Active</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-gray-200">
              ${parsedValue.base_roi_amount}{" "}
              {parsedValue.boost_applied && (
                <span className="text-xs text-green-400">
                  + ${parsedValue.booster_amount}
                </span>
              )}
            </div>

            {parsedValue.active_booster_level && (
              <div className="text-purple-600 font-semibold">
                L{parsedValue.active_booster_level}
              </div>
            )}
          </div>
        </div>
      );
    },
  });
}



// Add Details button column for level commission
if (transaction_type === "level_commission") {
  conditionalColumns.push({
    key: "details",
    label: "Details",
    render: (value, row) => (
      <button
        onClick={() => handleViewDetails(row)}
        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Eye className="w-4 h-4 mr-1" />
        View Details
      </button>
    ),
  });
}

// Add User column for direct bonus
if (transaction_type === "direct_bonus") {
  conditionalColumns.push({
    key: "user",
    label: "User",
    render: (value, row) => {
      const parsedDetails = parseSourceDetails(row.source_details);

      return (
        <div className="flex flex-col">
          <span className="font-semibold">
            {parsedDetails.username || "Unknown User"}
          </span>
          <span className="text-xs text-gray-300">
            {parsedDetails.email || "No email provided"}
          </span>
        </div>
      );
    },
  });
}

if (transaction_type === "deposit") {
  conditionalColumns.push({
    key: "processed_by",
    label: "Processed by",
    render: (value, row) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          {row.processed_by === 1 ? "Admin" : "Self"}
        </span>
      </div>
    ),
  });
}

// Combine base columns with conditional columns
// Insert conditional columns before the last column (Date)
const columns = [
  ...baseColumns.slice(0, -1), // All base columns except the last one (Date)
  ...conditionalColumns,       // All conditional columns
  baseColumns[baseColumns.length - 1] // The Date column at the end
];
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };
  // Transform data for table
  const tableData = transactions.map((transaction) => ({
    ...transaction,
    date: transaction.created_at, // Add date field for filtering
  }));

  // Calculate summary statistics
  const totalAmount = tableData.reduce(
    (sum, transaction) => sum + parseFloat(transaction.amount),
    0
  );
  const totalTransactions = tableData.length;
  const completedTransactions = tableData.filter(
    (t) => t.status === "completed"
  ).length;
  const pendingTransactions = tableData.filter(
    (t) => t.status === "pending"
  ).length;

  return (
    <div className="bg-gradient-to-br  from-[#1e1e1e] to-[#2a2a2a] ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className=" p-4 border-b border-white/20">
          <h1 className="text-2xl font-semibold text-green-500">
            Transaction Dashboard
          </h1>
          <p className="text-gray-200">
            Manage and monitor all financial transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          {/* Total Amount */}
          <div className="bg-green-900/80 p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatAmount(totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-blue-900/80 p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-white">
                  {totalTransactions}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Completed Transactions */}
          <div className="bg-emerald-900/80 p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Completed</p>
                <p className="text-2xl font-bold text-green-400">
                  {completedTransactions}
                </p>
              </div>
              <div className="p-3 bg-emerald-600/20 rounded-lg">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-yellow-900/80 p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {pendingTransactions}
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="px-4 pb-4">
          <Table
            data={tableData}
            columns={columns}
            pageSize={10}
            searchable={true}
            dateFilterable={true}
            className="shadow-sm"
          />
          <CommissionBreakdown
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            transaction={selectedTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
