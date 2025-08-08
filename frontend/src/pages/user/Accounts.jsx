

import React, { useState } from "react";
import {
  AccountList,
  Alert,
  CreateAccountForm,
  UpdateAccountForm,
} from "../../components/features/user/AccountComponent";
import { useAccount, useUserAccounts } from "../../hooks/useAccounts";

// Main Wallet Management Component
export const Accounts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const { error: globalError, clearError } = useAccount();
  const { accounts, isLoading, error, loadMore, refresh, pagination } =
    useUserAccounts();
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // List auto-refreshes due to Redux update
  };

  const handleUpdateSuccess = () => {
    setEditingAccount(null);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setEditingAccount(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Global Error Alert */}
        {globalError && (
          <div className="mb-6">
            <Alert
              type="error"
              message={globalError}
              onClose={clearError}
              darkMode
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Wallet Management
              </h1>
              <p className="text-gray-400">
                Manage your cryptocurrency wallets and accounts
              </p>
            </div>
            {accounts?.length === 0 && (
              <button
                onClick={handleShowCreateForm}
                className={`mt-4 sm:mt-0 px-6 py-2 rounded-md font-medium transition-all
                ${
                  showCreateForm
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } 
                text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900`}
              >
                {showCreateForm ? "Cancel" : "Add New Wallet"}
              </button>
            )}
          </div>

          {/* Create Form Section */}
          {showCreateForm && (
            <div className="mb-8 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl">
              <CreateAccountForm onSuccess={handleCreateSuccess} darkMode />
            </div>
          )}

          {/* Update Form Section */}
          {editingAccount && (
            <div className="mb-8 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl">
              <UpdateAccountForm
                account={editingAccount}
                onSuccess={handleUpdateSuccess}
                onCancel={handleCancelEdit}
                darkMode
              />
            </div>
          )}
        </div>

        {/* Accounts List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
          <AccountList
            accounts={accounts}
            loadMore={loadMore}
            isLoading={isLoading}
            error={error}
            refresh={refresh}
            pagination={pagination}
            onEditAccount={handleEditAccount}
            darkMode
          />
        </div>
      </div>
    </div>
  );
};

export default Accounts;
