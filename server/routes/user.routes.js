const express = require("express");
const { body } = require("express-validator");
const UserController = require("../controllers/user.controller");
const AuthMiddleware = require("../middlewares/auth");
const router = express.Router();

// Profile update validation
const updateProfileValidation = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("full_name")
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("date_of_birth")
    .optional()
    .isDate()
    .withMessage("Please provide a valid date of birth"),
  body("country_code")
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage("Country code must be 2 characters"),
];  

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// User routes
router.get("/me", UserController.getUserProfile); // Get own profile
router.get(
  "/self-roi",
  AuthMiddleware.authorize("user"),
  UserController.selfROIProcess
); // Get own profile
router.put("/profile", updateProfileValidation, UserController.updateProfile); // Update own profile
router.get("/referrals", UserController.getUserReferrals); // Get own referrals

// Admin/Manager routes
router.get("/", AuthMiddleware.authorize("admin"), UserController.getAllUsers);
router.get(
  "/stats",
  AuthMiddleware.authorize("admin"),
  UserController.getUserStats
);
router.get(
  "/:id",
  AuthMiddleware.authorize("admin", "manager"),
  UserController.getUserById
);
router.put(
  "/profile/update",
  AuthMiddleware.authorize("admin", "manager"),
  AuthMiddleware.checkOwnership,
  updateProfileValidation,
  UserController.updateProfile
);
router.get(
  "/:id/referrals",
  AuthMiddleware.authorize("admin", "manager"),
  UserController.getUserReferrals
);

// Admin only routes
router.put(
  "/:id/status",
  AuthMiddleware.authorize("admin"),
  UserController.updateUserStatus
);
router.put(
  "/:id/role",
  AuthMiddleware.authorize("admin"),
  UserController.updateUserRole
);
router.delete(
  "/:id",
  AuthMiddleware.authorize("admin"),
  UserController.deleteUser
);

module.exports = router;

// ==================== MAIN APP SETUP ====================
