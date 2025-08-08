import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { Table } from "../../components/common/Tables";
import { useSearchParams } from "react-router-dom";
import { useAdminTransactions, useTransactionStats } from "../../hooks/useTransactions";
import { Button } from "../../components/common/Button";
// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800", icon: Check };
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: AlertCircle,
        };
      case "failed":
        return { bg: "bg-red-100", text: "text-red-800", icon: X };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: AlertCircle };
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
        return { bg: "bg-blue-100", text: "text-blue-800", icon: TrendingUp };
      case "roi_earning":
        return { bg: "bg-green-100", text: "text-green-800", icon: DollarSign };
      case "direct_bonus":
        return { bg: "bg-purple-100", text: "text-purple-800", icon: Users };
      case "level_commission":
        return { bg: "bg-orange-100", text: "text-orange-800", icon: Activity };
      case "transfer_in":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          icon: DollarSign,
        };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: Activity };
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

// Main Transaction Dashboard Component
const Transactions = () => {
  const [searchParams] = useSearchParams();
  const transaction_type = searchParams.get("transactionType");
  const { transactions, setFilters } = useAdminTransactions();
  useEffect(() => {
    if (transaction_type) {
      setFilters({ transaction_type });
    }
  }, [transaction_type]);

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount helper
  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (value) => `#${value}`,
    },
    {
      key: "username",
      label: "User",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          <span className="text-xs text-gray-200">{row.email}</span>
        </div>
      ),
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
      key: "reference_id",
      label: "Reference",
      render: (value) => (
        <span className="font-mono text-xs bg-gray-700 text-blue-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value) => formatDate(value),
    },
  ];

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
    <div className="min-h-screen bg-[var(--bg-inner)]">
      <div className="max-w-7xl mx-auto pb-4">
        {/* Header */}
        <div className=" p-4 border-b border-white/20">
          <h1 className="text-2xl font-semibold text-[var(--title-color)]">
            Transaction Dashboard
          </h1>
          <p className="text-base text-[var(--subtitle-color)]">
            Manage and monitor all financial transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div className="bg-[var(--grid-bg-2)] p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-[var(--title-color)]">
                  Total Amount
                </p>
                <p className="text-2xl font-semibold  text-[var(--subtitle-color)] ">
                  {formatAmount(totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-[var(--icon-bg-2)] rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--grid-bg-1)] p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-[var(--title-color)]">
                  Total Transactions
                </p>
                <p className="text-2xl font-semibold  text-[var(--subtitle-color)] ">
                  {totalTransactions}
                </p>
              </div>
              <div className="p-3 bg-[var(--icon-bg-1)] rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--grid-bg-3)] p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-[var(--title-color)]">Completed</p>
                <p className="text-2xl font-semibold text-green-600">
                  {completedTransactions}
                </p>
              </div>
              <div className="p-3 bg-[var(--icon-bg-3)] rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--grid-bg-8)] p-4 rounded-md border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-[var(--title-color)]">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {pendingTransactions}
                </p>
              </div>
              <div className="p-3 bg-[var(--icon-bg-5)] rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="px-4">
        <Table
          data={tableData}
          columns={columns}
          pageSize={10}
          searchable={true}
          dateFilterable={true}
          className="shadow-sm"
        />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
