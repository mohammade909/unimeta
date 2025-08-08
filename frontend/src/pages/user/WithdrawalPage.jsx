import React, { useState, useEffect } from "react";
import { useWithdrawals } from "../../hooks/useWithdrawals";
import WithdrawalRequestForm from "../../components/features/user/WithdrawaForm";
import Withdrawals from "../../components/features/user/Withdrawals";
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";

const WithdrawalManager = () => {
  const { stats, actions } = useWithdrawals();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  useEffect(() => {
    actions.fetchStats();
  }, [actions]);

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      processing: { color: "bg-blue-100 text-blue-800", icon: RefreshCw },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle form success
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    actions.fetchUserWithdrawals();
    actions.fetchStats();
  };

  // Refresh data
  const refreshData = () => {
    actions.fetchUserWithdrawals();
    actions.fetchStats();
  };

  // Export data (placeholder)
  const exportData = () => {
    // Implement export functionality
    console.log("Exporting withdrawal data...");
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen px-4">
        <div className="max-w-4xl mx-auto">
          <WithdrawalRequestForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1e1e1e]  rounded-md shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-green-300 flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Withdrawal Management
              </h1>
              <p className="text-gray-300  font-medium ">
                Manage your withdrawal requests and track their status
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-100 bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-gray-100 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-800/40 rounded-lg border border-white/20 shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-800 rounded-md p-2">
                <DollarSign className="w-6 h-6 text-blue-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-300">
                  Total Withdrawn
                </p>
                <p className="text-xl font-semibold text-gray-100">
                  {formatCurrency(stats?.totalWithdrawn || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-800/40 rounded-md border border-white/20 shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-300">Pending</p>
                <p className="text-xl font-semibold text-gray-100">
                  {formatCurrency(stats?.pendingAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-800/40 rounded-md border border-white/20 shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-300">Completed</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats?.completedCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-800/40 rounded-md border border-white/20 shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-300">Rejected</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats?.rejectedCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Withdrawals />

        {/* Withdrawal Details Modal */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Withdrawal Request #{selectedWithdrawal.id}
                  </h3>
                  <button
                    onClick={() => setSelectedWithdrawal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedWithdrawal.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Method
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedWithdrawal.withdrawal_method.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Requested Amount
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency(selectedWithdrawal.requested_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Net Amount
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency(selectedWithdrawal.net_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fee
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency(selectedWithdrawal.fee_amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Created
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedWithdrawal.created_at)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Withdrawal Address
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedWithdrawal.withdrawal_address}
                    </p>
                  </div>

                  {selectedWithdrawal.withdrawal_details && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Details
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(
                            selectedWithdrawal.withdrawal_details,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedWithdrawal(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalManager;
