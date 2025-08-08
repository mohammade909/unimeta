const database = require("../database"); // Adjust path as needed

class Rewards {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || "";
    this.description = data.description || "";
    this.reward_type = data.reward_type || "achievement";
    this.business_threshold = data.business_threshold || null;
    this.team_size_threshold = data.team_size_threshold || null;
    this.direct_referrals_threshold = data.direct_referrals_threshold || null;
    this.duration_days = data.duration_days || null;
    this.reward_amount = data.reward_amount || null;
    this.reward_percentage = data.reward_percentage || null;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.start_date = data.start_date || null;
    this.end_date = data.end_date || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push("Title is required");
    }

    if (this.title && this.title.length > 255) {
      errors.push("Title cannot exceed 255 characters");
    }

    const validRewardTypes = ["achievement", "milestone", "monthly", "weekly"];
    if (!validRewardTypes.includes(this.reward_type)) {
      errors.push("Invalid reward type");
    }

    if (this.business_threshold !== null && this.business_threshold < 0) {
      errors.push("Business threshold cannot be negative");
    }

    if (this.team_size_threshold !== null && this.team_size_threshold < 0) {
      errors.push("Team size threshold cannot be negative");
    }

    if (
      this.direct_referrals_threshold !== null &&
      this.direct_referrals_threshold < 0
    ) {
      errors.push("Direct referrals threshold cannot be negative");
    }

    if (this.duration_days !== null && this.duration_days < 0) {
      errors.push("Duration days cannot be negative");
    }

    if (this.reward_amount !== null && this.reward_amount < 0) {
      errors.push("Reward amount cannot be negative");
    }

    if (
      this.reward_percentage !== null &&
      (this.reward_percentage < 0 || this.reward_percentage > 100)
    ) {
      errors.push("Reward percentage must be between 0 and 100");
    }

    if (
      this.start_date &&
      this.end_date &&
      new Date(this.start_date) > new Date(this.end_date)
    ) {
      errors.push("Start date cannot be after end date");
    }

    return errors;
  }

  // Create a new reward program
  async save() {
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const sql = `
      INSERT INTO reward_programs (
        title, description, reward_type, business_threshold, team_size_threshold,
        direct_referrals_threshold, duration_days, reward_amount, reward_percentage,
        is_active, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.title,
      this.description,
      this.reward_type,
      this.business_threshold,
      this.team_size_threshold,
      this.direct_referrals_threshold,
      this.duration_days,
      this.reward_amount,
      this.reward_percentage,
      this.is_active,
      this.start_date,
      this.end_date,
    ];

    try {
      const result = await database.query(sql, params);
      this.id = result.insertId;
      return this;
    } catch (error) {
      throw new Error(`Error creating reward program: ${error.message}`);
    }
  }

  // Update existing reward program
  async update() {
    if (!this.id) {
      throw new Error("Cannot update reward program without ID");
    }

    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const sql = `
      UPDATE reward_programs SET
        title = ?, description = ?, reward_type = ?, business_threshold = ?,
        team_size_threshold = ?, direct_referrals_threshold = ?, duration_days = ?,
        reward_amount = ?, reward_percentage = ?, is_active = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `;

    const params = [
      this.title,
      this.description,
      this.reward_type,
      this.business_threshold,
      this.team_size_threshold,
      this.direct_referrals_threshold,
      this.duration_days,
      this.reward_amount,
      this.reward_percentage,
      this.is_active,
      this.start_date,
      this.end_date,
      this.id,
    ];

    try {
      const result = await database.query(sql, params);
      if (result.affectedRows === 0) {
        throw new Error("Reward program not found");
      }
      return this;
    } catch (error) {
      throw new Error(`Error updating reward program: ${error.message}`);
    }
  }

  // Find reward program by ID
  static async findById(id) {
    const sql = "SELECT * FROM reward_programs WHERE id = ?";

    try {
      const results = await database.query(sql, [id]);
      if (results.length === 0) {
        return null;
      }
      return new Rewards(results[0]);
    } catch (error) {
      throw new Error(`Error finding reward program: ${error.message}`);
    }
  }

  // Find all reward programs with optional filters
  static async findAll(filters = {}) {
    let sql = "SELECT * FROM reward_programs WHERE 1=1";
    const params = [];

    // Apply filters
    if (filters.reward_type) {
      sql += " AND reward_type = ?";
      params.push(filters.reward_type);
    }

    if (filters.is_active !== undefined) {
      sql += " AND is_active = ?";
      params.push(filters.is_active);
    }

    if (filters.start_date) {
      sql += " AND start_date >= ?";
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += " AND end_date <= ?";
      params.push(filters.end_date);
    }

    // Add ordering BEFORE limit/offset
    sql += " ORDER BY created_at DESC";

    // Add pagination
    if (filters.limit) {
      sql += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      sql += " OFFSET ?";
      params.push(parseInt(filters.offset));
    }

    try {
      const results = await database.queryWithLimitOffset(sql, params);
      return results.map((row) => new Rewards(row));
    } catch (error) {
      throw new Error(`Error finding reward programs: ${error.message}`);
    }
  }

  // Get count of reward programs with filters
  static async count(filters = {}) {
    let sql = "SELECT COUNT(*) as total FROM reward_programs WHERE 1=1";
    const params = [];

    // Apply same filters as findAll
    if (filters.reward_type) {
      sql += " AND reward_type = ?";
      params.push(filters.reward_type);
    }

    if (filters.is_active !== undefined) {
      sql += " AND is_active = ?";
      params.push(filters.is_active);
    }

    if (filters.start_date) {
      sql += " AND start_date >= ?";
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += " AND end_date <= ?";
      params.push(filters.end_date);
    }

    try {
      const results = await database.query(sql, params);
      return results[0].total;
    } catch (error) {
      throw new Error(`Error counting reward programs: ${error.message}`);
    }
  }

  // Get active reward programs
  static async findActive() {
    const sql = `
      SELECT * FROM reward_programs 
      WHERE is_active = true 
      AND (start_date IS NULL OR start_date <= CURDATE())
      AND (end_date IS NULL OR end_date >= CURDATE())
      ORDER BY created_at DESC
    `;

    try {
      const results = await database.query(sql);
      return results.map((row) => new Rewards(row));
    } catch (error) {
      throw new Error(`Error finding active reward programs: ${error.message}`);
    }
  }

  // Get reward programs by type
  static async findByType(rewardType) {
    const sql =
      "SELECT * FROM reward_programs WHERE reward_type = ? ORDER BY created_at DESC";

    try {
      const results = await database.query(sql, [rewardType]);
      return results.map((row) => new Rewards(row));
    } catch (error) {
      throw new Error(
        `Error finding reward programs by type: ${error.message}`
      );
    }
  }

  // Delete reward program
  async delete() {
    if (!this.id) {
      throw new Error("Cannot delete reward program without ID");
    }

    const sql = "DELETE FROM reward_programs WHERE id = ?";

    try {
      const result = await database.query(sql, [this.id]);
      if (result.affectedRows === 0) {
        throw new Error("Reward program not found");
      }
      return true;
    } catch (error) {
      throw new Error(`Error deleting reward program: ${error.message}`);
    }
  }

  // Soft delete (deactivate)
  async deactivate() {
    this.is_active = false;
    return await this.update();
  }

  // Activate reward program
  async activate() {
    this.is_active = true;
    return await this.update();
  }

  // Convert to JSON (for API responses)
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      reward_type: this.reward_type,
      business_threshold: this.business_threshold,
      team_size_threshold: this.team_size_threshold,
      direct_referrals_threshold: this.direct_referrals_threshold,
      duration_days: this.duration_days,
      reward_amount: this.reward_amount,
      reward_percentage: this.reward_percentage,
      is_active: this.is_active,
      start_date: this.start_date,
      end_date: this.end_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Rewards;
