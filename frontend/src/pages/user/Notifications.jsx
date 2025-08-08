import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, X, Clock, AlertCircle, Info } from "lucide-react";
import useNotifications from "../../hooks/useNotifications";
import { useSelector } from "react-redux";
import { selectUserToken } from "../../store/slices/authSlice";

const Notifications = () => {
  const token = useSelector(selectUserToken);
  const {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications(token);

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, fetchNotifications]);

  const handleNotificationClick = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Show only the first 3 notifications
  const displayedNotifications = notifications.slice(0, 3);

  return (
    <div className="">
  <div className="overflow-y-auto">
    {displayedNotifications.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-3">
          <Bell className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-sm text-gray-300 text-center">No notifications yet</p>
        <p className="text-xs text-gray-500 text-center mt-1">
          You're all caught up!
        </p>
      </div>
    ) : (
      <div className="divide-y divide-gray-700">
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            className={`px-4 py-4 cursor-pointer transition-all duration-200 relative group rounded-md mb-2 ${
              !notification.is_read
                ? "bg-[#1e1e1e] hover:bg-[#1e1e1e]/50"
                : "bg-[#1e1e1e] hover:bg-[#1e1e1e]/50"
            }`}
          >
            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="absolute left-2 top-6 w-2 h-2 bg-blue-500 rounded-full shadow-md" />
            )}

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1 text-blue-400">
                {getTypeIcon(notification.type)}
              </div>

              <div className="w-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white line-clamp-1">
                      {notification.title}
                    </h4>
                    <p className="text-base text-gray-200 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-300 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(notification.created_at)}
                      </span>

                      {/* Type Badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${
                          notification.type === "info"
                            ? "bg-blue-700/20 text-blue-300 border-blue-500"
                            : notification.type === "warning"
                            ? "bg-yellow-700/20 text-green-300 border-yellow-500"
                            : notification.type === "success"
                            ? "bg-green-700/20 text-green-300 border-green-500"
                            : notification.type === "error"
                            ? "bg-red-700/20 text-red-300 border-red-500"
                            : "bg-gray-700/20 text-gray-300 border-gray-500"
                        }`}
                      >
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-md"></div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

  );
};

export default Notifications;
