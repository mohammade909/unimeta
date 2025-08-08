// hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { BASEURL } from "../baseurl";
const useNotifications = (token) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = BASEURL;

  // Initialize socket connection
  useEffect(() => {
    if (token) {
      const newSocket = io(`${BASEURL}`, {
        auth: { token },
        autoConnect: true,
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
      });

      newSocket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/notification-icon.png",
          });
        }
      });

      newSocket.on("unreadCountUpdate", (count) => {
        setUnreadCount(count);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log(data);
        if (data.success) {
          if (page === 1) {
            setNotifications(data.data.notifications);
          } else {
            setNotifications((prev) => [...prev, ...data.data.notifications]);
          }
          setUnreadCount(data.data.unreadCount);
          return data.data;
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    },
    [token, API_BASE_URL]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === parseInt(notificationId)
                ? { ...notif, is_read: true }
                : notif
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to mark notification as read");
      }
    },
    [token, API_BASE_URL]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to mark all notifications as read");
    }
  }, [token, API_BASE_URL]);

  // Send notification (admin only)
  const sendNotification = useCallback(
    async (notificationData) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationData),
        });

        const data = await response.json();

        if (data.success) {
          return data;
        } else {
          setError(data.message);
          return null;
        }
      } catch (err) {
        setError("Failed to send notification");
        return null;
      }
    },
    [token, API_BASE_URL]
  );

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    requestNotificationPermission,
    clearError: () => setError(null),
  };
};

export default useNotifications;
