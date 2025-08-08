// models/Notification.js
const db = require("../database");

class Notification {
  // Create a new notification
  static async create(notificationData) {
    const { title, message, type, sender_id, recipient_id } = notificationData;

    const query = `
      INSERT INTO notifications (title, message, type, sender_id, recipient_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const dbResult = await db.query(query, [
        title,
        message,
        type,
        sender_id,
        recipient_id,
      ]);
      
      // Handle both array and non-array returns from different db libraries
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return result.insertId;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get all notifications for a specific user
  static async getByUserId(userId, page = 1, limit = 20) {
    // Ensure parameters are proper integers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;
    const userIdNum = parseInt(userId, 10);

    // Validate limit and offset to prevent SQL injection
    if (limitNum < 1 || limitNum > 100) throw new Error('Invalid limit value');
    if (offset < 0) throw new Error('Invalid offset value');

    const query = `
      SELECT n.*, u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.recipient_id = ? OR n.recipient_id IS NULL
      ORDER BY n.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    try {
      const dbResult = await db.query(query, [userIdNum]);
      const notifications = Array.isArray(dbResult) ? dbResult : dbResult;
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      console.error("Error getting notifications by user ID:", error);
      console.error("Parameters:", { userId: userIdNum, limit: limitNum, offset });
      throw error;
    }
  }

  // Get unread notifications count for a user
  static async getUnreadCount(userId) {
    const userIdNum = parseInt(userId, 10);
    
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE (recipient_id = ? OR recipient_id IS NULL) AND is_read = FALSE
    `;

    try {
      const dbResult = await db.query(query, [userIdNum]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      const rows = Array.isArray(result) ? result : [result];
      return rows[0]?.count || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      console.error("Parameters:", { userId: userIdNum });
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const notificationIdNum = parseInt(notificationId, 10);
    const userIdNum = parseInt(userId, 10);
    
    const query = `
      UPDATE notifications
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND (recipient_id = ? OR recipient_id IS NULL)
    `;

    try {
      const dbResult = await db.query(query, [notificationIdNum, userIdNum]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      console.error("Parameters:", { notificationId: notificationIdNum, userId: userIdNum });
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    const userIdNum = parseInt(userId, 10);
    
    const query = `
      UPDATE notifications
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE (recipient_id = ? OR recipient_id IS NULL) AND is_read = FALSE
    `;

    try {
      const dbResult = await db.query(query, [userIdNum]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return result.affectedRows || 0;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      console.error("Parameters:", { userId: userIdNum });
      throw error;
    }
  }

  // Get all notifications (admin only)
  static async getAll(page = 1, limit = 20) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Validate limit and offset to prevent SQL injection
    if (limitNum < 1 || limitNum > 100) throw new Error('Invalid limit value');
    if (offset < 0) throw new Error('Invalid offset value');

    const query = `
      SELECT n.*, 
             u1.username as sender_name,
             u2.username as recipient_name
      FROM notifications n
      LEFT JOIN users u1 ON n.sender_id = u1.id
      LEFT JOIN users u2 ON n.recipient_id = u2.id
      ORDER BY n.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    try {
      const dbResult = await db.query(query);
      const notifications = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      console.error("Error getting all notifications:", error);
      console.error("Parameters:", { limit: limitNum, offset });
      throw error;
    }
  }

  // Delete notification
  static async delete(notificationId) {
    const query = `DELETE FROM notifications WHERE id = ?`;
    
    try {
      const dbResult = await db.query(query, [notificationId]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Get notification by ID
  static async getById(notificationId) {
    const query = `
      SELECT n.*, 
             u1.username as sender_name,
             u2.username as recipient_name
      FROM notifications n
      LEFT JOIN users u1 ON n.sender_id = u1.id
      LEFT JOIN users u2 ON n.recipient_id = u2.id
      WHERE n.id = ?
    `;

    try {
      const dbResult = await db.query(query, [notificationId]);
      const notifications = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      const notificationArray = Array.isArray(notifications) ? notifications : [notifications];
      return notificationArray[0] || null;
    } catch (error) {
      console.error("Error getting notification by ID:", error);
      throw error;
    }
  }

  // Get all user IDs for broadcasting
  static async getAllUserIds() {
    const query = `SELECT id FROM users WHERE is_active = TRUE`;
    
    try {
      const dbResult = await db.query(query);
      const users = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      const userArray = Array.isArray(users) ? users : [users];
      return userArray.map((user) => user.id);
    } catch (error) {
      console.error("Error getting all user IDs:", error);
      throw error;
    }
  }

  // Additional utility methods for better functionality

  // Get notifications with filters
  static async getWithFilters(userId, filters = {}, page = 1, limit = 20) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;
    const userIdNum = parseInt(userId, 10);

    // Validate limit and offset to prevent SQL injection
    if (limitNum < 1 || limitNum > 100) throw new Error('Invalid limit value');
    if (offset < 0) throw new Error('Invalid offset value');

    let whereConditions = ['(n.recipient_id = ? OR n.recipient_id IS NULL)'];
    let queryParams = [userIdNum];

    // Add type filter
    if (filters.type) {
      whereConditions.push('n.type = ?');
      queryParams.push(filters.type);
    }

    // Add read status filter
    if (filters.isRead !== undefined) {
      whereConditions.push('n.is_read = ?');
      queryParams.push(filters.isRead);
    }

    // Add date range filter
    if (filters.startDate) {
      whereConditions.push('n.created_at >= ?');
      queryParams.push(filters.startDate);
    }

    if (filters.endDate) {
      whereConditions.push('n.created_at <= ?');
      queryParams.push(filters.endDate);
    }

    const query = `
      SELECT n.*, u.username as sender_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY n.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    try {
      const dbResult = await db.query(query, queryParams);
      const notifications = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      console.error("Error getting notifications with filters:", error);
      throw error;
    }
  }

  // Bulk create notifications (for broadcasting)
  static async bulkCreate(notifications) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return [];
    }

    const query = `
      INSERT INTO notifications (title, message, type, sender_id, recipient_id)
      VALUES ?
    `;

    const values = notifications.map(notification => [
      notification.title,
      notification.message,
      notification.type,
      notification.sender_id,
      notification.recipient_id
    ]);

    try {
      const dbResult = await db.query(query, [values]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return {
        insertedCount: result.affectedRows,
        firstInsertId: result.insertId
      };
    } catch (error) {
      console.error("Error bulk creating notifications:", error);
      throw error;
    }
  }

  // Delete old notifications (cleanup utility)
  static async deleteOldNotifications(daysOld = 30) {
    const daysOldNum = parseInt(daysOld, 10) || 30;
    
    const query = `
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    try {
      const dbResult = await db.query(query, [daysOldNum]);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      return result.affectedRows || 0;
    } catch (error) {
      console.error("Error deleting old notifications:", error);
      throw error;
    }
  }

  // Get notification statistics
  static async getStats(userId = null) {
    let query, params;

    if (userId) {
      // Stats for specific user
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count,
          COUNT(DISTINCT type) as type_count
        FROM notifications
        WHERE recipient_id = ? OR recipient_id IS NULL
      `;
      params = [userId];
    } else {
      // Global stats
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count,
          COUNT(DISTINCT type) as type_count,
          COUNT(DISTINCT recipient_id) as recipient_count
        FROM notifications
      `;
      params = [];
    }

    try {
      const dbResult = await db.query(query, params);
      const result = Array.isArray(dbResult) ? dbResult[0] : dbResult;
      const rows = Array.isArray(result) ? result : [result];
      return rows[0] || {
        total: 0,
        read_count: 0,
        unread_count: 0,
        type_count: 0,
        recipient_count: 0
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw error;
    }
  }
}

module.exports = Notification;