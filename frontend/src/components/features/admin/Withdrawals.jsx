import React, { useState, useCallback, useEffect } from "react";
import {
  Edit3,
  Eye,
  Check,
  X,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Table } from "../../common/Tables";
import {
  useAdminWithdrawals,
  useOptimisticWithdrawals,
} from "../../../hooks/useWithdrawals";
import { Button } from "../../common/Button";
import WagmiCryptoComponent from "../shared/WagmiCryptoComponent";

const WithdrawalsComponent = ({ withdrawalType }) => {
  const {
    withdrawals,
    pagination,
    statistics,
    filters,
    loading,
    error,
    updateRequest,
    fetchWithdrawals,
    updateWithdrawalStatus,
    setFilters,
    clearFilters,
    resetUpdate,
  } = useAdminWithdrawals(true, { withdrawalType });
  const { optimisticStatusUpdate } = useOptimisticWithdrawals();

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (withdrawalType) {
      setFilters({ ...filters, withdrawalType });
    }
  }, [withdrawalType]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      processing: { color: "bg-blue-100 text-blue-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReject = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setAdminNotes("");
    setRejectModal(true);
  };

  const handleComplete = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setTransactionId("");
    setAdminNotes("");
    setCompleteModal(true);
  };

  const submitRejection = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) return;

    // Optimistic update
    optimisticStatusUpdate(selectedWithdrawal.id, "rejected");

    try {
      await updateWithdrawalStatus(selectedWithdrawal.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
        admin_notes: adminNotes,
      });
      setRejectModal(false);
      setSelectedWithdrawal(null);
      setRejectionReason("");
      setAdminNotes("");
    } catch (error) {
      // Revert optimistic update on error
      fetchWithdrawals();
      console.error("Rejection failed:", error);
    }
  };

  const submitCompletion = async () => {
    if (!selectedWithdrawal || !transactionId.trim()) return;

    // Optimistic update
    optimisticStatusUpdate(selectedWithdrawal.id, "completed");

    try {
      await updateWithdrawalStatus(selectedWithdrawal.id, {
        status: "completed",
        transaction_id: transactionId,
        admin_notes: adminNotes,
      });
      setCompleteModal(false);
      setSelectedWithdrawal(null);
      setTransactionId("");
      setAdminNotes("");
    } catch (error) {
      // Revert optimistic update on error
      fetchWithdrawals();
      console.error("Completion failed:", error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    // For simple status updates that don't require additional info
    if (newStatus === "processing") {
      // Optimistic update
      optimisticStatusUpdate(id, newStatus);

      try {
        await updateWithdrawalStatus(id, { status: newStatus });
      } catch (error) {
        // Revert optimistic update on error
        fetchWithdrawals();
      }
    }
  };

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDetailsModal(true);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (_value, _row, index) => (
        <span className="font-mono text-sm text-gray-100">#{index + 1}</span>
      ),
    },
    {
      key: "username",
      label: "User",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-100">{value}</span>
          <span className="text-sm text-gray-100">{row.email}</span>
        </div>
      ),
    },
    {
      key: "requested_amount",
      label: "Amount",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-100">
            {formatCurrency(value)}
          </span>
          <span className="text-sm text-gray-100">
            Fee: {formatCurrency(row.fee_amount)}
          </span>
          <span className="text-sm font-medium text-green-600">
            Net: {formatCurrency(row.net_amount)}
          </span>
        </div>
      ),
    },
    {
      key: "withdrawal_method",
      label: "Method",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-100">{value}</span>
          <span className="text-sm text-gray-100 truncate max-w-32">
            {row.withdrawal_address}
          </span>
        </div>
      ),
    },
    {
      key: "withdrawal_type",
      label: "Type",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-100">{value}</span>
          <span className="text-sm text-gray-100 truncate max-w-32">
            {row.withdrawal_address}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value) => (
        <span className="text-sm text-gray-100">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openDetailsModal(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {row.status === "pending" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleComplete(row)}
                className="text-green-600 hover:text-green-800"
                title="Complete withdrawal"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(row)}
                className="text-red-600 hover:text-red-800"
                title="Reject withdrawal"
              >
                <X className="w-4 h-4" />
              </Button>

              {row?.wallet_address && (
                <WagmiCryptoComponent
                  mode="withdrawal"
                  val={parseFloat(row?.net_amount)}
                  toAddress={row?.wallet_address}
                  onTransactionComplete={(data) => {
                    console.log("Withdrawal completed:", data);
                  }}
                />
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(row.id, "processing")}
                className="text-blue-600 hover:text-blue-800"
                title="Mark as processing"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </>
          )}

          {row.status === "processing" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleComplete(row)}
                className="text-green-600 hover:text-green-800"
                title="Complete withdrawal"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(row)}
                className="text-red-600 hover:text-red-800"
                title="Reject withdrawal"
              >
                <X className="w-4 h-4" />
              </Button>
              {row?.wallet_address && (
                <WagmiCryptoComponent
                  mode="withdrawal"
                  val={parseFloat(row?.net_amount)}
                  toAddress={row?.wallet_address}
                  onTransactionComplete={(data) => {
                    console.log("Withdrawal completed:", data);
                  }}
                />
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[var(--bg-inner)]">
      {/* Header */}
      <div className="sm:flex p-4 border-b border-white/20 justify-between items-center">
        <div className="">
          <h2 className="text-2xl font-semibold text-[var(--title-color)]">
            Withdrawal Management
          </h2>
          <p className="text-[var(--subtitle-color)] text-base">
            Manage user withdrawal requests
          </p>
        </div>

        <div className="flex items-center space-x-4 sm:mt-0 mt-4">
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-white/20 text-[var(--subtitle-color)]   bg-[var(--grid-bg-1)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button onClick={clearFilters} variant="amber">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="p-4">
        <Table
          data={withdrawals}
          columns={columns}
          loading={loading}
          error={error}
          searchable={true}
          dateFilterable={true}
          className="shadow-sm"
        />

        {/* Reject Modal */}
        {rejectModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Reject Withdrawal
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Withdrawal ID: #{selectedWithdrawal.id} -{" "}
                {selectedWithdrawal.username}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please provide a reason for rejection"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Internal notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRejectModal(false);
                    setSelectedWithdrawal(null);
                    setRejectionReason("");
                    setAdminNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={submitRejection}
                  disabled={!rejectionReason.trim() || updateRequest.loading}
                >
                  {updateRequest.loading ? "Rejecting..." : "Reject Withdrawal"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Modal */}
        {completeModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-green-600">
                Complete Withdrawal
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Withdrawal ID: #{selectedWithdrawal.id} -{" "}
                {selectedWithdrawal.username}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID/Hash *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter transaction hash"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Internal notes"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCompleteModal(false);
                    setSelectedWithdrawal(null);
                    setTransactionId("");
                    setAdminNotes("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={submitCompletion}
                  disabled={!transactionId.trim() || updateRequest.loading}
                >
                  {updateRequest.loading
                    ? "Completing..."
                    : "Complete Withdrawal"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {detailsModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Withdrawal Details</h3>
                <Button variant="ghost" onClick={() => setDetailsModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2">#{selectedWithdrawal.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">User:</span>
                  <span className="ml-2">{selectedWithdrawal.username}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2">{selectedWithdrawal.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2">
                    {getStatusBadge(selectedWithdrawal.status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Requested Amount:
                  </span>
                  <span className="ml-2">
                    {formatCurrency(selectedWithdrawal.requested_amount)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fee Amount:</span>
                  <span className="ml-2">
                    {formatCurrency(selectedWithdrawal.fee_amount)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Net Amount:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    {formatCurrency(selectedWithdrawal.net_amount)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Method:</span>
                  <span className="ml-2">
                    {selectedWithdrawal.withdrawal_method}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="ml-2 font-mono text-sm">
                    {selectedWithdrawal.withdrawal_address}
                  </span>
                </div>

                {selectedWithdrawal?.rejection_reason && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Rejection Reason:
                    </span>
                    <div className="ml-2 mt-1 p-2 bg-red-50 rounded text-sm text-red-800">
                      {selectedWithdrawal.rejection_reason}
                    </div>
                  </div>
                )}
                {selectedWithdrawal.admin_notes && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Admin Notes:
                    </span>
                    <div className="ml-2 mt-1 p-2 bg-blue-50 rounded text-sm">
                      {selectedWithdrawal.admin_notes}
                    </div>
                  </div>
                )}
                {selectedWithdrawal.transaction_id && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">
                      Transaction ID:
                    </span>
                    <span className="ml-2 font-mono text-sm">
                      {selectedWithdrawal.transaction_id}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2">
                    {formatDate(selectedWithdrawal.created_at)}
                  </span>
                </div>
                {selectedWithdrawal.processed_at && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Processed:
                    </span>
                    <span className="ml-2">
                      {formatDate(selectedWithdrawal.processed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalsComponent;
