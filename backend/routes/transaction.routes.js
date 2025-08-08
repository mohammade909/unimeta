// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transaction.controller");
const AuthMiddleware = require("../middlewares/auth");
// Middleware (you'll need to implement these based on your auth system)

router.use(AuthMiddleware.authenticate);
// Public transaction lookup routes (with authentication)

// User transaction routes
router.get(
  "/user/",
  AuthMiddleware.authorize("user"),
  TransactionController.getUserTransactions
);
router.get(
  "/user/daily-limit",
  TransactionController.getUserDailyLimit
);


router.get("/admin/stats", TransactionController.getTransactionStats);
router.get(
  "/admin/all",
  AuthMiddleware.authorize("admin"),
  TransactionController.getAllTransactions
);
router.post(
  "/admin/create",
  AuthMiddleware.authorize("admin"),
  TransactionController.createTransaction
);
// Individual transaction routes
router.get("/:id", TransactionController.getTransactionById);
router.get(
  "/reference/:reference",
  TransactionController.getTransactionByReference
);
router.get("/hash/:hash", TransactionController.getTransactionByHash);
// Admin transaction management routes

router.put(
  "/admin/:id",
  AuthMiddleware.authorize("admin"),
  TransactionController.updateTransaction
);
router.patch(
  "/admin/:id/status",
  AuthMiddleware.authorize("admin"),
  TransactionController.updateTransactionStatus
);
router.delete(
  "/admin/:id",
  AuthMiddleware.authorize("admin"),
  TransactionController.deleteTransaction
);
// Statistics and export routes
// router.get(
//   "/admin/stats",
//   AuthMiddleware.authorize("admin", "user"),
//   TransactionController.getTransactionStats
// );
router.get(
  "/admin/export",
  AuthMiddleware.authorize("admin"),
  TransactionController.exportTransactions
);

module.exports = router;
