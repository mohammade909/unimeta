import React, { useState, useEffect } from "react";
import {
  useAccount,
  useAccountCreate,
  useAccountUpdate,
  useUserAccounts,
} from "../../../hooks/useAccounts";

// Alert Component
export const Alert = ({ type, message, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";

  return (
    <div className={`border px-4 py-3 rounded relative mb-4 ${bgColor}`}>
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <span
          className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className="fill-current h-6 w-6"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </span>
      )}
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
    ></div>
  );
};

// Create Account Form Component
export const CreateAccountForm = ({ onSuccess }) => {
  const { createAccount, isCreating, createError, createSuccess, clearError } =
    useAccountCreate();

  const [formData, setFormData] = useState({
    wallet_type: "BEP20",
    wallet_address: "",
    is_primary: true,
    is_verified: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.wallet_address.trim()) {
      return;
    }

    createAccount({ ...formData })
      .then(() => {
        if (onSuccess) onSuccess();
        // Reset form on success
        setFormData({
          wallet_type: "BEP20",
          wallet_address: "",
          is_primary: false,
          is_verified: false,
        });
      })
      .catch((error) => {
        console.error("Failed to create account:", error);
      });
  };

  return (
    <div className="max-w-md mx-auto bg-black rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Wallet</h2>

      {createError && (
        <Alert type="error" message={createError} onClose={clearError} />
      )}

      {createSuccess && (
        <Alert type="success" message="Wallet created successfully!" />
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-1">
            Wallet Type
          </label>
          <select
            name="wallet_type"
            value={formData.wallet_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="BEP20">USDT(BEP20)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            name="wallet_address"
            value={formData.wallet_address}
            onChange={handleChange}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter wallet address"
            required
          />
        </div>

        {/* <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-100">Primary Wallet</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-100">Verified</span>
          </label>
        </div> */}

        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isCreating ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            "Create Wallet"
          )}
        </button>
      </div>
    </div>
  );
};

// Update Account Form Component
export const UpdateAccountForm = ({ account, onSuccess, onCancel }) => {
  const { updateAccount, isUpdating, updateError, updateSuccess, clearError } =
    useAccountUpdate();

  const [formData, setFormData] = useState({
    wallet_type: account?.wallet_type || "ethereum",
    wallet_address: account?.wallet_address || "",
    is_primary: account?.is_primary || false,
    is_verified: account?.is_verified || false,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        wallet_type: account.wallet_type || "ethereum",
        wallet_address: account.wallet_address || "",
        is_primary: account.is_primary || false,
        is_verified: account.is_verified || false,
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.wallet_address.trim()) {
      return;
    }

    updateAccount(account.id, formData)
      .then(() => {
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        console.error("Failed to update account:", error);
      });
  };

  if (!account) {
    return <div>No account selected for update</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-black rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Update Wallet</h2>

      {updateError && (
        <Alert type="error" message={updateError} onClose={clearError} />
      )}

      {updateSuccess && (
        <Alert type="success" message="Wallet updated successfully!" />
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-50 mb-1">
            Wallet Type
          </label>
          <select
            name="wallet_type"
            value={formData.wallet_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Usdt">USDT (BEP20)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-50 mb-1">
            Wallet Address
          </label>
          <input
            type="text"
            name="wallet_address"
            value={formData.wallet_address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter wallet address"
            required
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-100">Primary Wallet</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-100">Verified</span>
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              "Update Wallet"
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AccountList = ({ onEditAccount , accounts, isLoading, error, loadMore, refresh, pagination }) => {


  const handleEdit = (account) => {
    if (onEditAccount) {
      onEditAccount(account);
    }
  };

  if (isLoading && accounts?.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="large" />
        <span className="ml-2 text-gray-600">Loading wallets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert type="error" message={error} />
        <button
          onClick={refresh}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b  border-white/30 pb-4">
        <h2 className="text-2xl font-semibold">My Wallets</h2>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Refreshing...</span>
            </>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      {accounts && accounts?.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No wallets found
            </h3>
            <p className="text-gray-500">
              Add your first wallet to get started managing your crypto
              accounts.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts?.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-[#141414]  rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-100">
                      {wallet.wallet_type?.toUpperCase()}
                    </span>
                    {wallet.is_primary && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 mr-2 rounded-full">
                        Primary
                      </span>
                    )}
                    {wallet.is_verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {/* <button
                    onClick={() => handleEdit(wallet)}
                    className="text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full px-2 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button> */}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-200 mb-1">Address:</p>
                  <div className="text-sm font-mono bg-gray-900 border border-white/20 p-2 rounded break-all">
                    {wallet.wallet_address}
                  </div>
                </div>

                <div className="text-xs text-gray-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>
                      {new Date(
                        wallet.created_at || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {wallet.updated_at && (
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>
                        {new Date(wallet.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}

          <div className="text-center mt-4 text-sm text-gray-100">
            Showing {accounts?.length} of {pagination.total || accounts?.length}{" "}
            Accounts
          </div>
        </>
      )}
    </div>
  );
};
