// routes/commissionRoutes.js
const express = require("express");
const router = express.Router();
const CommissionController = require("../controllers/CommissionController");
const AuthMiddleware = require("../middlewares/auth");
const commissionController = new CommissionController();

router.use(AuthMiddleware.authenticate);
// Initialize controller

// Admin only routes
router.post(
  "/process-all",
  AuthMiddleware.authorize("admin"),
  commissionController.processAllCommissions.bind(commissionController)
);

router.post(
  "/process-user/:userId",
  AuthMiddleware.authorize("admin"),
  commissionController.processUserCommission.bind(commissionController)
);

router.get(
  "/settings",
  AuthMiddleware.authorize("admin"),
  commissionController.getCommissionSettings.bind(commissionController)
);

// User routes (users can access their own data)
router.get(
  "/level-info/:userId?",
  commissionController.getUserLevelInfo.bind(commissionController)
);

router.get(
  "/referral-tree/:referralCode",
  commissionController.getUserReferralTree.bind(commissionController)
);

router.get(
  "/full-referral-tree/:referralCode",
  commissionController.getUserFullReferralTree.bind(commissionController)
);

router.get(
  "/history/:userId?",
  commissionController.getUserCommissionHistory.bind(commissionController)
);

module.exports = router;
