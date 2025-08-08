const InvestmentPlan = require("../models/Plan");
const catchAsync = require("../middlewares/cathAsyncErrorsMiddleware");

class InvestmentPlanController {
  // Create a new plan
  static create = catchAsync(async (req, res) => {
    const plan = new InvestmentPlan(req.body);
    await plan.create();
    res.status(201).json({ success: true, data: plan.toJSON() });
  });

  // Get all plans (paginated + optional search)
  static getAll = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await InvestmentPlan.getAll(page, limit, search);
    res.json({ success: true, ...result });
  });

  // Get active plans only
  static getActive = catchAsync(async (req, res) => {
    const plans = await InvestmentPlan.getActivePlans();
    res.json({ success: true, data: plans.map(p => p.toJSON()) });
  });

  // Get plan by ID
  static getById = catchAsync(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    res.json({ success: true, data: plan.toJSON() });
  });

  // Update a plan
  static update = catchAsync(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    Object.assign(plan, req.body);
    await plan.update();
    res.json({ success: true, data: plan.toJSON() });
  });

  // Delete a plan
  static delete = catchAsync(async (req, res) => {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    await plan.delete();
    res.json({ success: true, message: "Plan deleted successfully" });
  });

  // Validate amount for plan
  static validateAmount = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    const plan = await InvestmentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const result = plan.validateAmount(amount);
    res.json({ success: true, ...result });
  });

  // Calculate ROI
  static calculateROI = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    const plan = await InvestmentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const result = plan.calculateROI(amount);
    res.json({ success: true, data: result });
  });
}

module.exports = InvestmentPlanController;
