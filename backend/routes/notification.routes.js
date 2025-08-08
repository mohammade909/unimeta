// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notifications.controller");
const AuthMiddleware = require("../middlewares/auth");

// User routes
router.use(AuthMiddleware.authenticate);
router.get("/", NotificationController.getUserNotifications);
router.get("/unread-count", NotificationController.getUnreadCount);
router.put("/:notificationId/read", NotificationController.markAsRead);
router.put("/mark-all-read", NotificationController.markAllAsRead);

// Admin routes
router.post(
  "/",
  AuthMiddleware.authorize("admin"),
  NotificationController.createNotification
);
router.get(
  "/admin/all",
  AuthMiddleware.authorize("admin"),
  NotificationController.getAllNotifications
);
router.delete(
  "/:notificationId",
  AuthMiddleware.authorize("admin"),
  NotificationController.deleteNotification
);

module.exports = router;
