// models/UserWallet.js
const Database = require("../database");

class Wallet {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.main_balance = data.main_balance || 0.0;
    this.roi_balance = data.roi_balance || 0.0;
    this.commission_balance = data.commission_balance || 0.0;
    this.bonus_balance = data.bonus_balance || 0.0;
    this.locked_amount = data.locked_amount || 0.0;
    this.withdrawal_limit = data.withdrawal_limit || 0.0;
    this.total_earned = data.total_earned || 0.0;
    this.total_withdrawn = data.total_withdrawn || 0.0;
    this.total_invested = data.total_invested || 0.0;
    this.last_updated = data.last_updated || null;
    this.created_at = data.created_at || null;
  }

  // Create wallet
  async create() {
    const sql = `
      INSERT INTO user_wallets (
        user_id, main_balance, roi_balance, commission_balance, 
        bonus_balance, locked_amount, withdrawal_limit, 
        total_earned, total_withdrawn, total_invested, 
        last_updated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      this.user_id,
      this.main_balance,
      this.roi_balance,
      this.commission_balance,
      this.bonus_balance,
      this.locked_amount,
      this.withdrawal_limit,
      this.total_earned,
      this.total_withdrawn,
      this.total_invested,
    ];

    const result = await Database.query(sql, params);
    this.id = result.insertId;
    return this;
  }

  // Find wallet by user ID
  static async findByUserId(userId) {
    const sql = "SELECT * FROM user_wallets WHERE user_id = ?";
    const result = await Database.query(sql, [userId]);
    return result.length > 0 ? new Wallet(result[0]) : null;
  }

  // Find wallet by ID
  static async findById(id) {
    const sql = "SELECT * FROM user_wallets WHERE id = ?";
    const result = await Database.query(sql, [id]);
    return result.length > 0 ? new Wallet(result[0]) : null;
  }

  // Update wallet
  async update() {
    const sql = `
      UPDATE user_wallets SET 
        main_balance = ?, roi_balance = ?, commission_balance = ?,
        bonus_balance = ?, locked_amount = ?, withdrawal_limit = ?,
        total_earned = ?, total_withdrawn = ?, total_invested = ?,
        last_updated = NOW()
      WHERE id = ?
    `;

    const params = [
      this.main_balance,
      this.roi_balance,
      this.commission_balance,
      this.bonus_balance,
      this.locked_amount,
      this.withdrawal_limit,
      this.total_earned,
      this.total_withdrawn,
      this.total_invested,
      this.id,
    ];

    await Database.query(sql, params);
    return this;
  }

  // Add money to main balance
  async addMainBalance(amount, transactionData = {}) {
    const connection = await Database.beginTransaction();

    try {
      // Create transaction record using the Transaction model's create method
      const Transaction = require("./Transaction");

      // Ensure source_details is properly formatted as JSON
      let sourceDetails = transactionData.source_details || {
        description: "Admin added balance",
      };
      if (typeof sourceDetails === "string") {
        sourceDetails = { description: sourceDetails };
      }

      // Create transaction instance
      const transaction = new Transaction({
        user_id: this.user_id,
        transaction_type: "deposit", // Valid ENUM value
        amount: amount,
        fee_amount: transactionData.fee_amount || 0,
        net_amount: amount,
        currency: transactionData.currency || "USD",
        status: "completed",
        source_type: "internal",
        source_details: JSON.stringify(sourceDetails),
        processed_by: transactionData.processed_by || null,
        processed_at: new Date(),
        admin_notes: transactionData.admin_notes || null,
      });

      // Use the Transaction model's create method with the connection
      await transaction.create(connection);

      // Refresh wallet data from database (trigger has updated it)
      const refreshSql = `SELECT * FROM user_wallets WHERE id = ?`;
      const [walletRows] = await connection.execute(refreshSql, [this.id]);

      if (walletRows.length > 0) {
        Object.assign(this, walletRows[0]);
      }

      await connection.commit();
      connection.release();

      return {
        wallet: this,
        transaction_id: transaction.id,
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Deduct money from main balance
  async deductMainBalance(amount, transactionData = {}) {
    if (parseFloat(this.main_balance) < parseFloat(amount)) {
      throw new Error("Insufficient balance");
    }

    const connection = await Database.beginTransaction();

    try {
      // Create transaction record using the Transaction model's create method
      const Transaction = require("./Transaction");

      // Ensure source_details is properly formatted as JSON
      let sourceDetails = transactionData.source_details || {
        description: "Admin deducted balance",
      };
      if (typeof sourceDetails === "string") {
        sourceDetails = { description: sourceDetails };
      }

      // Create transaction instance
      const transaction = new Transaction({
        user_id: this.user_id,
        transaction_type: "transfer_out", // Valid ENUM value
        amount: amount,
        fee_amount: transactionData.fee_amount || 0,
        net_amount: amount,
        currency: transactionData.currency || "USD",
        status: "completed",
        source_type: "internal",
        source_details: JSON.stringify(sourceDetails),
        processed_by: transactionData.processed_by || null,
        processed_at: new Date(),
        admin_notes: transactionData.admin_notes || null,
      });

      // Use the Transaction model's create method with the connection
      await transaction.create(connection);

      // Refresh wallet data from database (trigger has updated it)
      const refreshSql = `SELECT * FROM user_wallets WHERE id = ?`;
      const [walletRows] = await connection.execute(refreshSql, [this.id]);

      if (walletRows.length > 0) {
        Object.assign(this, walletRows[0]);
      }

      await connection.commit();
      connection.release();

      return {
        wallet: this,
        transaction_id: transaction.id,
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Get all wallets with pagination
  static async getAll(page = 1, limit = 10, search = "") {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT w.*, u.username, u.email 
      FROM user_wallets w 
      LEFT JOIN users u ON w.user_id = u.id
    `;
    let countSql =
      "SELECT COUNT(*) as total FROM user_wallets w LEFT JOIN users u ON w.user_id = u.id";
    let params = [];

    if (search) {
      sql += " WHERE u.username LIKE ? OR u.email LIKE ?";
      countSql += " WHERE u.username LIKE ? OR u.email LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    sql += " ORDER BY w.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [wallets, countResult] = await Promise.all([
      Database.query(sql, params),
      Database.query(countSql, search ? [`%${search}%`, `%${search}%`] : []),
    ]);

    return {
      wallets,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Delete wallet
  async delete() {
    const sql = "DELETE FROM user_wallets WHERE id = ?";
    await Database.query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      main_balance: parseFloat(this.main_balance),
      roi_balance: parseFloat(this.roi_balance),
      commission_balance: parseFloat(this.commission_balance),
      bonus_balance: parseFloat(this.bonus_balance),
      locked_amount: parseFloat(this.locked_amount),
      withdrawal_limit: parseFloat(this.withdrawal_limit),
      total_earned: parseFloat(this.total_earned),
      total_withdrawn: parseFloat(this.total_withdrawn),
      total_invested: parseFloat(this.total_invested),
      last_updated: this.last_updated,
      created_at: this.created_at,
    };
  }
}

module.exports = Wallet;
