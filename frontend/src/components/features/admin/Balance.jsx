import React, { useState } from "react";
import { DollarSign, Plus, Minus, X } from "lucide-react";
import { useAdminWallet } from "../../../hooks/useWallet";
import Loading from "../../common/Loading";

// Popup Component
const MoneyPopup = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentBalance,
  isProcessing,
}) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        reason: reason.trim(),
        type,
      });
      setAmount("");
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("Error processing transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setReason("");
    onClose();
  };

  if (!isOpen) return null;
  if (isProcessing) {
    <Loading />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-inner)] rounded-md p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--title-color)]">
            {type === "add" ? "Add Money" : "Deduct Money"}
          </h3>
          <button
            onClick={handleClose}
            className="text-[var(--title-color)] hover:text-[var(--title-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-[var(--title-color)]">
            Current Balance:{" "}
            <span className="font-medium text-green-600">
              ${currentBalance}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter reason for transaction"
              rows="3"
            />
          </div>

          <div className="flex space-x-3">
            
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                type === "add"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading
                ? "Processing..."
                : type === "add"
                ? "Add Money"
                : "Deduct Money"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-[var(--subtitle-color)] bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BalanceCell = ({ value, userId, onBalanceUpdate }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const { addBalance, deductBalance, loading } = useAdminWallet();

  const handleAddMoney = () => {
    setTransactionType("add");
    setPopupOpen(true);
  };

  const handleDeductMoney = () => {
    setTransactionType("deduct");
    setPopupOpen(true);
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      if (transactionData.type === "add") {
        await addBalance(
          userId,
          transactionData.amount,
          transactionData.reason
        );
      } else if (transactionData.type === "deduct") {
        await deductBalance(
          userId,
          transactionData.amount,
          transactionData.reason
        );
      }

      if (onBalanceUpdate) {
        onBalanceUpdate(userId, transactionData);
      }
    } catch (error) {
      console.error("Wallet transaction error:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  const isProcessing = loading.add || loading.deduct;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center text-green-300 font-medium">
        <DollarSign className="w-4 h-4 mr-1" />
        {value || "0.00"}
      </div>

      <div className="flex space-x-1">
        <button
          onClick={handleAddMoney}
          className="p-1 text-white hover:bg-green-500 bg-green-600 rounded transition-colors"
          title="Add Money"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleDeductMoney}
          className="p-1 text-white hover:bg-red-500 bg-red-600 rounded transition-colors"
          title="Deduct Money"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <MoneyPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSubmit={handleTransactionSubmit}
        type={transactionType}
        currentBalance={value || 0}
        isProcessing={isProcessing}
      />
    </div>
  );
};

// Usage in your table column
const tableColumn = {
  key: "main_balance",
  label: "Balance",
  render: (value, row) => (
    <BalanceCell
      value={value}
      userId={row.id}
      onBalanceUpdate={(userId, transactionData) => {
        console.log("Update balance for user:", userId, transactionData);
      }}
    />
  ),
};

export { BalanceCell, MoneyPopup };
export default tableColumn;
