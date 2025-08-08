import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
  TrendingUp,
} from "lucide-react";

import {
  useInvestments,
  useUserInvestments,
} from "../../../hooks/useInvestment";
import { useWallet } from "../../../hooks/useWallet";
import { toast } from "react-hot-toast";
const AdditionalInvestmentComponent = () => {
  const { loading, errors, actions } = useInvestments();
  const {
    userInvestments,
    loading: userLoading,
    actions: userActions,
  } = useUserInvestments({ autoFetch: true });
  const { userWallet, getUserWallet } = useWallet();
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    fee_amount: 0,
    admin_notes: "",
    source_details: {
      description: "Additional investment",
      method: "platform",
    },
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Filter only active investments
  const activeInvestments =
    userInvestments?.filter((inv) => inv.status === "active") || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpenModal = (investment) => {
    if (userWallet.main_balance <= 0) {
      return toast.error("Insufficient Balance");
    }
    setSelectedInvestment(investment);
    setShowModal(true);
    setFormData({
      amount: "",
      currency: investment.currency || "USD",
      fee_amount: 0,
      admin_notes: "",
      source_details: {
        description: "Additional investment",
        method: "platform",
      },
    });
    actions.clearErrors();
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvestment(null);
    setFormData({
      amount: "",
      currency: "USD",
      fee_amount: 0,
      admin_notes: "",
      source_details: {
        description: "Additional investment",
        method: "platform",
      },
    });
    actions.clearErrors();
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInvestment) return;
    if (userWallet.main_balance > formData.amount) {
      return toast.error("Insufficient Balance");
    }
    try {
      await actions.reInvest(selectedInvestment.id, formData);
      setSuccessMessage("Additional investment added successfully!");
      setTimeout(() => {
        handleCloseModal();
        getUserWallet();
        userActions.getUserInvestments();
      }, 2000);
    } catch (error) {
      console.error("Error adding additional investment:", error);
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-500 mb-2">
          Add Additional Investment
        </h1>
        <p className="text-gray-200">
          Increase your investment in active plans to maximize returns
        </p>
      </div>

      {activeInvestments.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Investments
          </h3>
          <p className="text-gray-500">
            You don't have any active investments to add money to.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeInvestments.map((investment) => (
            <div
              key={investment._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {investment.plan_name}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      investment.invested_amount,
                      investment.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(
                      investment.current_value,
                      investment.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ROI:</span>
                  <span className="font-medium text-green-600">
                    +{investment.daily_roi_percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">
                    {formatDate(investment.created_at)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenModal(investment)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Re Top-up
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Add Additional Investment
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">
                {selectedInvestment.plan_name}
              </h3>
              <p className="text-sm text-gray-600">
                Current:{" "}
                {formatCurrency(
                  selectedInvestment.current_value,
                  selectedInvestment.currency
                )}
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            )}

            {errors.create && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 text-sm">{errors.create}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Amount *
                </label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="admin_notes"
                  value={formData.admin_notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading.create || !formData.amount}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading.create ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Investment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInvestmentComponent;
