// models/InvestmentPlan.js
const Database = require("../database");

class InvestmentPlan {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || null;
    this.description = data.description || null;
    this.min_amount = data.min_amount || 0.0;
    this.max_amount = data.max_amount || 0.0;
    this.daily_roi_percentage = data.daily_roi_percentage || 0.0;
    this.total_roi_percentage = data.total_roi_percentage || 0.0;
    this.duration_days = data.duration_days || 0;
    this.sponsor_bonus_percentage = data.sponsor_bonus_percentage || 0.0;
    this.max_daily_gigs = data.max_daily_gigs || 0;
    this.max_roi_amount = data.max_roi_amount || null;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.sort_order = data.sort_order || 0;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Create investment plan
  async create() {
    const sql = `
      INSERT INTO investment_plans (
        name, description, min_amount, max_amount, daily_roi_percentage,
        total_roi_percentage, duration_days, sponsor_bonus_percentage,
        max_daily_gigs, max_roi_amount, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.name,
      this.description,
      this.min_amount,
      this.max_amount,
      this.daily_roi_percentage,
      this.total_roi_percentage,
      this.duration_days,
      this.sponsor_bonus_percentage,
      this.max_daily_gigs,
      this.max_roi_amount,
      this.is_active,
      this.sort_order,
    ];

    const result = await Database.query(sql, params);
    this.id = result.insertId;
    return this;
  }

  // Find plan by ID
  static async findById(id) {
    const sql = "SELECT * FROM investment_plans WHERE id = ?";
    const result = await Database.query(sql, [id]);
    return result.length > 0 ? new InvestmentPlan(result[0]) : null;
  }

  // Get all active plans
  static async getActivePlans() {
    const sql = `
      SELECT * FROM investment_plans 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC, id ASC
    `;
    const result = await Database.query(sql);
    return result.map(plan => new InvestmentPlan(plan));
  }

  
  static async getAll(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM investment_plans";
    let countSql = "SELECT COUNT(*) as total FROM investment_plans";
    let params = [];

    if (search) {
      sql += " WHERE name LIKE ? OR description LIKE ?";
      countSql += " WHERE name LIKE ? OR description LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    sql += " ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [plans, countResult] = await Promise.all([
      Database.query(sql, params),
      Database.query(countSql, search ? [`%${search}%`, `%${search}%`] : []),
    ]);

    return {
      plans: plans.map(plan => new InvestmentPlan(plan)),
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Update plan
  async update() {
    const sql = `
      UPDATE investment_plans SET 
        name = ?, description = ?, min_amount = ?, max_amount = ?,
        daily_roi_percentage = ?, total_roi_percentage = ?, duration_days = ?,
        sponsor_bonus_percentage = ?, max_daily_gigs = ?, max_roi_amount = ?,
        is_active = ?, sort_order = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const params = [
      this.name,
      this.description,
      this.min_amount,
      this.max_amount,
      this.daily_roi_percentage,
      this.total_roi_percentage,
      this.duration_days,
      this.sponsor_bonus_percentage,
      this.max_daily_gigs,
      this.max_roi_amount,
      this.is_active,
      this.sort_order,
      this.id,
    ];

    await Database.query(sql, params);
    return this;
  }

  // Delete plan
  async delete() {
    const sql = "DELETE FROM investment_plans WHERE id = ?";
    await Database.query(sql, [this.id]);
    return true;
  }

  // Validate investment amount
  validateAmount(amount) {
    const numAmount = parseFloat(amount);
    if (numAmount < this.min_amount) {
      return {
        valid: false,
        message: `Minimum investment amount is $${this.min_amount}`,
      };
    }
    if (numAmount > this.max_amount) {
      return {
        valid: false,
        message: `Maximum investment amount is $${this.max_amount}`,
      };
    }
    return { valid: true };
  }

  // Calculate ROI details
  calculateROI(amount) {
    const investmentAmount = parseFloat(amount);
    const dailyROI = (investmentAmount * this.daily_roi_percentage) / 100;
    const totalROI = (investmentAmount * this.total_roi_percentage) / 100;
    const maxROI = this.max_roi_amount ? Math.min(totalROI, this.max_roi_amount) : totalROI;
    
    return {
      investment_amount: investmentAmount,
      daily_roi: dailyROI,
      total_roi: maxROI,
      duration_days: this.duration_days,
      sponsor_bonus: (investmentAmount * this.sponsor_bonus_percentage) / 100,
      expected_total: investmentAmount + maxROI,
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      min_amount: parseFloat(this.min_amount),
      max_amount: parseFloat(this.max_amount),
      daily_roi_percentage: parseFloat(this.daily_roi_percentage),
      total_roi_percentage: parseFloat(this.total_roi_percentage),
      duration_days: this.duration_days,
      sponsor_bonus_percentage: parseFloat(this.sponsor_bonus_percentage),
      max_daily_gigs: this.max_daily_gigs,
      max_roi_amount: this.max_roi_amount ? parseFloat(this.max_roi_amount) : null,
      is_active: this.is_active,
      sort_order: this.sort_order,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = InvestmentPlan;