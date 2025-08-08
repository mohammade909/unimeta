const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawal.controller");
const { authenticate, authorize } = require("../middlewares/auth");

router.use(authenticate);
// User Routes
router.get("/all", authorize("admin"), withdrawalController.getAllWithdrawals);
router.post("/request", withdrawalController.createWithdrawal);
router.get("/my-withdrawals", withdrawalController.getUserWithdrawals);
router.get("/:id", withdrawalController.getWithdrawal);

// Admin Routes
router.put("/:id", authorize("admin"), withdrawalController.updateWithdrawal);
router.get(
  "/stats/overview",
  authorize("admin"),
  withdrawalController.getStats
);

module.exports = router;
