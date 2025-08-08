import React, { useState } from "react";
import { Eye, X, Clock, CheckCircle, XCircle } from "lucide-react";
import { Table } from "../../common/Tables";
import { useUserWithdrawals } from "../../../hooks/useWithdrawals";
import { Button } from "../../common/Button";

const WithdrawalsComponent = () => {
  const { withdrawals, loading, error } = useUserWithdrawals();


  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

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
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
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

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDetailsModal(true);
  };

  const columns = [
    {
      key: "index",
      label: "S.No",
      render: (_value, _row, index) => (
        <span className="font-mono text-sm text-gray-100">#{index + 1}</span>
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
          <span className="text-sm text-gray-200">
            Fee: {formatCurrency(row.fee_amount)}
          </span>
          <span className="text-sm font-medium text-green-600">
            Net: {formatCurrency(row.net_amount)}
          </span>
        </div>
      ),
    },
    {
      key: "withdrawal_type",
      label: "Type",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-200">{value}</span>
          <span className="text-sm text-gray-200 truncate max-w-32">
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
        <span className="text-sm text-gray-200">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Button
           
            size="sm"
            onClick={() => openDetailsModal(row)}
            className=" text-gray-50  hover:text-gray-300"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Table
        data={withdrawals}
        columns={columns}
        loading={loading}
        error={error}
        searchable={true}
        dateFilterable={true}
        className="shadow-sm"
      />

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
              {/* {selectedWithdrawal.withdrawal_details && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Details:</span>
                  <div className="ml-2 mt-1 p-2 bg-gray-50 rounded text-sm">
                    {selectedWithdrawal.withdrawal_details}
                  </div>
                </div>
              )} */}
              {selectedWithdrawal.rejection_reason && (
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
                  <span className="font-medium text-gray-700">Processed:</span>
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
  );
};

export default WithdrawalsComponent;
