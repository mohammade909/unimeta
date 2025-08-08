import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  X,
  Check,
  AlertCircle,
  Users,
  UserPlus,
  Settings,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Award,
  TrendingUp,
  TreePine,
  Trees,
  Share,
  LogInIcon,
  LogIn,
} from "lucide-react";
import { useUsers } from "../../hooks/useUserApi";
import { Button } from "../../components/common/Button";
import { Table } from "../../components/common/Tables";
import { Modal } from "../../components/common/Modal";
import { useDispatch } from "react-redux";
import { adminLoginAsUser } from "../../store/slices/authSlice";
import { StatusBadge } from "../../components/common/StatusBadge";
import { BalanceCell } from "../../components/features/admin/Balance";
import { toast } from "react-hot-toast";

const UsersManger = () => {
  const dispatch = useDispatch();
  // Use the complete useUsers hook
  const {
    // Data
    users,
    filteredUsers,
    loading,
    error,
    message,
    filters,
    pagination,

    // Actions
    fetchUsers,
    removeUser,
    updateUserData,
    searchUsers,
    filterByStatus,
    sortUsers,
    clearFilters,
    changePage,
    clearErrorState,
    clearMessageState,
  } = useUsers();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers({page:1});
  }, [fetchUsers]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessageState();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessageState]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchUsers(value);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterByStatus(status === "all" ? "" : status);
  };

  // Handle sorting
  const handleSort = (field) => {
    setSortBy(field);
    const order = sortBy === field ? "asc" : "desc";
    sortUsers(field, order);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("createdAt");
    clearFilters();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm(user);
    setShowEditModal(true);
  };
  const handleLoginUser = async (user) => {
    try {
      const response = await dispatch(adminLoginAsUser({ email: user.email }));
      if (response.payload && response.payload.success) {
        const { token, user: loggedInUser } = response.payload;
        const dashboardUrl = `/user/dashboard?token=${token}&auto_login=true`;
        window.open(dashboardUrl);
      } else {
        console.error("Login failed:", response.payload?.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await removeUser(selectedUser.id);
        setShowDeleteModal(false);
        setSelectedUser(null);
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  const saveEdit = async () => {
    if (selectedUser) {
      try {
        await updateUserData(selectedUser.id, editForm);
        setShowEditModal(false);
        setSelectedUser(null);
      } catch (err) {
        console.error("Failed to update user:", err);
      }
    }
  };

  // Use filteredUsers from the hook instead of users directly
  const displayUsers =
    filteredUsers.length > 0 || filters.search || filters.status
      ? filteredUsers
      : users;

  const columns = [
    {
      key: "full_name",
      label: "User",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {row.full_name?.charAt(0)}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-100">{row.full_name}</div>
            <div className="text-gray-200 text-sm">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "referral_code",
      label: "Referral code",
      render: (value) => (
        <div className="flex items-center text-gray-200">
          <Share className="w-4 h-4 mr-1" />
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "premium"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "main_balance",
      label: "Balance",
      render: (value, row) => (
        <BalanceCell
          value={value}
          userId={row.id}
          onBalanceUpdate={() => {
            fetchUsers(1);
            toast.success("Opration Successfull!");
          }}
        />
      ),
    },
    {
      key: "total_earned",
      label: "Earnings",
      render: (value) => (
        <div className="flex items-center text-green-300 font-medium">
          <DollarSign className="w-4 h-4 mr-1" />
          {value || "0.00"}
        </div>
      ),
    },
    {
      key: "total_invested",
      label: "Investment",
      render: (value) => (
        <div className="flex items-center text-blue-300 font-medium">
          <DollarSign className="w-4 h-4 mr-1" />
          {value || "0.00"}
        </div>
      ),
    },

    {
      key: "total_referrals",
      label: "Referrals",
      render: (value) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-200" />
          {value || 0}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Join Date",
      render: (value) => (
        <div className="text-white">
          {value ? new Date(value).toLocaleDateString() : "N/A"},
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLoginUser(row);
            }}
            className="text-blue-600 hover:text-blue-700 bg-blue-200"
          >
            <LogIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditUser(row);
            }}
            className="text-blue-600 hover:text-blue-700 bg-blue-200"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteUser(row);
            }}
            className="text-red-600 hover:text-red-700 bg-red-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-800",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.status === "active").length,
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-800",
    },
    {
      title: "Premium Users",
      value: users.filter((u) => u.role === "premium").length,
      icon: Award,
      color: "purple",
      bgColor: "bg-purple-800",
    },
    {
      title: "Total Earnings",
      value: `$${users
        .reduce((sum, u) => sum + (u.totalEarnings || 0), 0)
        .toFixed(2)}`,
      icon: DollarSign,
      color: "yellow",
      bgColor: "bg-yellow-800",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-inner)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between p-4">
            <div className="">
              <h1 className="text-2xl font-semibold flex items-center">
                {/* <Shield className="w-8 h-8 mr-3 text-blue-600" /> */}
                <div className="text-[var(--title-color)]">
                  User Management
                  <p className="text-base text-[var(--subtitle-color)] font-medium ">
                    Manage and monitor all users in your system
                  </p>
                </div>
              </h1>
            </div>
            <Button variant="primary" size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pb-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={` ${stat.bgColor} rounded-md shadow-sm  p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className=" text-base font-semibold text-[var(--title-color)]">
                    {stat.title}
                  </p>
                  <p className="text-xl font-semibold mt-1 text-[var(--subtitle-color)]">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-${stat.color}-900 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 text-gray-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="px-4 pb-4">
          <div className="  bg-[var(--bg-inner)] p-4 rounded-md shadow-sm border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300  text-[var(--subtitle-color)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              {/* <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="px-3 py-2 border border-white/20 bg-[var(--icon-bg-2)]  text-[var(--subtitle-color)] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10/page</option>
                  <option value="50">50/page</option>
                  <option value="100">100/page</option>
                  <option value="500">500/page</option>
                  <option value="1000">1000/page</option>
                  <option value="10000">All</option>
                </select>
              </div> */}

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 bg-[var(--icon-bg-2)]  text-[var(--subtitle-color)] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm  text-[var(--subtitle-color)]">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 border border-white/20  text-[var(--subtitle-color)] bg-[var(--icon-bg-1)]  rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Date Joined</option>
                  <option value="name">Name</option>
                  <option value="totalEarnings">Earnings</option>
                  <option value="referrals">Referrals</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(filters.search ||
                filters.status ||
                filters.sortBy !== "createdAt") && (
                <Button
                  variant="golden"
                  size="sm"
                  onClick={handleClearFilters}
                  className=" text-[var(--subtitle-color)]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="px-4">
          {/* Alert Messages */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">{message}</span>
                <button
                  onClick={clearMessageState}
                  className="ml-auto text-green-600 hover:text-green-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
                <button
                  onClick={clearErrorState}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          {loading?.users ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="">
              <Table
                data={displayUsers}
                columns={columns}
                pageSize={10}
                searchable={false} // We're handling search externally
                dateFilterable={false} // We're handling filtering externally
              />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {pagination.currentPage * pagination.pageSize -
                      pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => changePage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => changePage(pagination.currentPage + 1)}
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit User Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Edit User"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-2 border text-[var(--subtitle-color)] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full p-2 border text-[var(--subtitle-color)] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full p-2 border text-[var(--subtitle-color)] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                  Status
                </label>
                <select
                  value={editForm.status || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full p-2 border text-[var(--subtitle-color)] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--subtitle-color)] mb-2">
                  Role
                </label>
                <select
                  value={editForm.role || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full p-2 border text-[var(--subtitle-color)] border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="primary"
                  onClick={saveEdit}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Confirm Delete"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedUser?.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="danger"
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete User
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default UsersManger;
