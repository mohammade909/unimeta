const express = require("express");
const router = express.Router();
const InvestmentPlanController = require("../controllers/investment.plan.controller");
const AuthMiddleware = require('../middlewares/auth');

// router.use(AuthMiddleware.authenticate)
// Public
router.get("/active",  InvestmentPlanController.getActive);

// CRUD
// router.get("/", InvestmentPlanController.getAll);
router.post("/", AuthMiddleware.authorize('user', 'admin'), InvestmentPlanController.create);
router.get("/:id", AuthMiddleware.authorize('user', 'admin'), InvestmentPlanController.getById);
router.put("/:id", AuthMiddleware.authorize('admin'), InvestmentPlanController.update);
router.delete("/:id", AuthMiddleware.authorize('admin'), InvestmentPlanController.delete);

// Extras
router.post("/:id/validate", AuthMiddleware.authorize('user', 'admin'), InvestmentPlanController.validateAmount);
router.post("/:id/roi", AuthMiddleware.authorize('user', 'admin'), InvestmentPlanController.calculateROI);

module.exports = router;
