// routes/systemSettings.js
const express = require("express");
const router = express.Router();
const SystemSettingsController = require("../controllers/system.setting.controller");
const AuthMiddleware = require("../middlewares/auth");

// router.use(AuthMiddleware.authenticate);
// Validation middleware for JSON body
const validateJsonBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: "Invalid JSON body",
  });
};

// Routes

// GET /api/system-settings - Get all system settings with pagination and filters
router.get(
  "/",
  // AuthMiddleware.authorize("admin"),
  SystemSettingsController.getAllSettings
);

// GET /api/system-settings/count - Get count of system settings
router.get(
  "/count",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.getSettingsCount
);

// GET /api/system-settings/:id - Get system setting by ID
router.get(
  "/:id",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.getSettingById
);

// GET /api/system-settings/key/:key - Get system setting by key
router.get(
  "/key/:key",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.getSettingByKey
);

// GET /api/system-settings/value/:key - Get setting value by key
router.get(
  "/value/:key",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.getSettingValue
);

// POST /api/system-settings - Create new system setting
router.post(
  "/",
  validateJsonBody,
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.createSetting
);

// PUT /api/system-settings/:id - Update system setting by ID
router.put(
  "/:id",
  validateJsonBody,
  // AuthMiddleware.authorize("admin"),
  SystemSettingsController.updateSetting
);

// PATCH /api/system-settings/value/:key - Update setting value by key
router.patch(
  "/value/:key",
  validateJsonBody,
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.updateSettingValue
);

// PATCH /api/system-settings/:id/deactivate - Soft delete (deactivate) system setting
router.patch(
  "/:id/deactivate",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.softDeleteSetting
);

// DELETE /api/system-settings/:id - Delete system setting by ID
router.delete(
  "/:id",
  AuthMiddleware.authorize("admin"),
  SystemSettingsController.deleteSetting
);

module.exports = router;

// Usage in your main app.js or server.js:
/*
const systemSettingsRoutes = require('./routes/systemSettings');
app.use('/api/system-settings', systemSettingsRoutes);
*/
