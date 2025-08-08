// controllers/Notification.js
const Notification = require("../models/Notifications");
const { getSocketIO } = require("../utils/socket");

class NotificationController {
  // Create and send notification
  static async createNotification(req, res) {
    try {
      const { title, message, type = "info", recipient_id } = req.body;
      const sender_id = req.user.id;

      // Validate required fields
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      // Create notification in database
      const notificationId = await Notification.create({
        title,
        message,
        type,
        sender_id,
        recipient_id: recipient_id || null,
      });

      // Get the created notification
      const notification = await Notification.getById(notificationId);

      // Get Socket.IO instance
      const io = getSocketIO();

      if (recipient_id) {
        // Send to specific user
        io.to(`user_${recipient_id}`).emit("newNotification", {
          id: notificationId,
          title,
          message,
          type,
          sender_name: req.user.username,
          created_at: notification.created_at,
        });
      } else {
        // Broadcast to all users
        io.emit("newNotification", {
          id: notificationId,
          title,
          message,
          type,
          sender_name: req.user.username,
          created_at: notification.created_at,
        });
      }

      res.status(201).json({
        success: true,
        message: "Notification sent successfully",
        data: { notificationId },
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user's notifications
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const notifications = await Notification.getByUserId(userId, page, limit);
      const unreadCount = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page,
            limit,
            hasMore: notifications.length === limit,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const success = await Notification.markAsRead(notificationId, userId);

      if (success) {
        // Emit updated unread count
        const io = getSocketIO();
        const unreadCount = await Notification.getUnreadCount(userId);
        io.to(`user_${userId}`).emit("unreadCountUpdate", unreadCount);

        res.json({
          success: true,
          message: "Notification marked as read",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const affectedRows = await Notification.markAllAsRead(userId);

      // Emit updated unread count
      const io = getSocketIO();
      io.to(`user_${userId}`).emit("unreadCountUpdate", 0);

      res.json({
        success: true,
        message: `${affectedRows} notifications marked as read`,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get unread count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Admin: Get all notifications
  static async getAllNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const notifications = await Notification.getAll(page, limit);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            hasMore: notifications.length === limit,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching all notifications:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const success = await Notification.delete(notificationId);

      if (success) {
        res.json({
          success: true,
          message: "Notification deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = NotificationController;
