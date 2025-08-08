// models/Transaction.js
const Database = require("../database");
const crypto = require("crypto");
const Wallet = require("./Wallet"); // Assuming Wallet model exists
const SystemSettings = require("./SystemSettings");
class Transaction {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.transaction_hash =
      data.transaction_hash || this.generateTransactionHash();
    this.reference_id = data.reference_id || this.generateReferenceId();
    this.transaction_type = data.transaction_type || null; // credit, debit, transfer
    this.amount = data.amount || 0.0;
    this.fee_amount = data.fee_amount || 0.0;
    this.net_amount = data.net_amount || 0.0;
    this.currency = data.currency || "USD";
    this.status = data.status || "pending"; // pending, completed, failed, cancelled
    this.related_user_id = data.related_user_id || null;
    this.related_investment_id = data.related_investment_id || null;
    this.source_type = data.source_type || null; // admin_credit, admin_debit, investment, withdrawal, etc.
    this.source_details = data.source_details || null;
    this.processed_by = data.processed_by || null;
    this.processed_at = data.processed_at || null;
    this.admin_notes = data.admin_notes || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async initializeSettings() {
    try {
      const capSettings = await SystemSettings.getValueByKey("daily_capping");
      if (capSettings) {
        const limitSetting =
          typeof capSettings === "string"
            ? JSON.parse(capSettings)
            : capSettings;

        if (!limitSetting.enabled || !limitSetting.limit) {
          throw new Error("Invalid commission settings structure");
        }

        return limitSetting;
      } else {
        throw new Error("Level processing settings not found");
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Error parsing commission settings JSON:", error);
        throw new Error("Invalid JSON format in commission settings");
      }
      console.error("Error initializing commission settings:", error);
      throw error;
    }
  }

  // Generate unique transaction hash
  generateTransactionHash() {
    return crypto.randomBytes(16).toString("hex").toUpperCase();
  }

  // Generate unique reference ID
  generateReferenceId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  async getUserWallet(userId) {
    try {
      const wallet = await Wallet.findByUserId(userId);
      return wallet;
    } catch (error) {
      console.error(`Error fetching wallet for user ${userId}:`, error);
      return null;
    }
  }

  async validateWalletLimits(connection, userId, transactionType, amount) {
    // Get current wallet state
    const wallet = await this.getUserWallet(userId);

    if (!wallet) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const currentRoiBalance = parseFloat(wallet.roi_balance) || 0;
    const currentCommissionBalance = parseFloat(wallet.commission_balance) || 0;
    const currentBonusBalance = parseFloat(wallet.bonus_balance) || 0;
    const totalInvested = parseFloat(wallet.total_invested) || 0;

    // If no investment, don't allow earning transactions
    if (totalInvested <= 0) {
      const earningTypes = [
        "level_commission",
        "reward_bonus",
        "direct_bonus",
        "salary",
        "roi_earning",
      ];
      if (earningTypes.includes(transactionType)) {
        throw new Error(
          `Cannot process ${transactionType} - user has no investments`
        );
      }
    }

    // Calculate current total earnings
    const currentTotalEarnings =
      currentRoiBalance + currentCommissionBalance + currentBonusBalance;

    // Define limits
    const totalEarningsLimit = totalInvested * 4; // Total limit: 4x investment
    const roiLimit = totalInvested * 2; // ROI limit: 2x investment

    // Validate based on transaction type
    switch (transactionType) {
      case "roi_earning":
        return this.validateRoiEarning(
          currentRoiBalance,
          currentCommissionBalance,
          currentBonusBalance,
          amount,
          roiLimit,
          totalEarningsLimit
        );

      case "level_commission":
      case "direct_bonus":
      case "reward_bonus":
      case "salary":
        return this.validateCommissionEarning(
          currentTotalEarnings,
          amount,
          totalEarningsLimit
        );

      default:
        // For other transaction types, no validation needed
        console.log(
          `No validation required for transaction type: ${transactionType}`
        );
        return {
          allowed: true,
          actualAmount: amount,
          cappedAmount: 0,
          message: "No validation required",
        };
    }
  }

  validateRoiEarning(
    currentRoiBalance,
    currentCommissionBalance,
    currentBonusBalance,
    requestedAmount,
    roiLimit,
    totalEarningsLimit
  ) {
    const currentTotalEarnings =
      currentRoiBalance + currentCommissionBalance + currentBonusBalance;
    const remainingTotalCapacity = totalEarningsLimit - currentTotalEarnings;
    const remainingRoiCapacity = roiLimit - currentRoiBalance;

    // Check if already at total limit
    if (remainingTotalCapacity <= 0) {
      return {
        allowed: false,
        actualAmount: 0,
        cappedAmount: requestedAmount,
        message: "Total earnings limit (4x investment) already reached",
      };
    }

    // Check if already at ROI limit
    if (remainingRoiCapacity <= 0) {
      return {
        allowed: false,
        actualAmount: 0,
        cappedAmount: requestedAmount,
        message: "ROI earnings limit (2x investment) already reached",
      };
    }

    // ALTERNATIVE BUSINESS RULES (choose one based on your requirements):

    // Option 1: ROI and Commission/Bonus are mutually exclusive (current restrictive approach)
    // Uncomment this if you want to keep the original restrictive logic:
    /*
    if (currentCommissionBalance > 0 || currentBonusBalance > 0) {
      return {
        allowed: false,
        actualAmount: 0,
        cappedAmount: requestedAmount,
        message: "Cannot earn ROI - user has already earned commission or bonus",
      };
    }
    */

    // Option 2: ROI earnings are reduced by existing commission/bonus (proportional approach)
    // Uncomment this if you want ROI to be reduced based on existing earnings:
    /*
    const commissionBonusTotal = currentCommissionBalance + currentBonusBalance;
    const adjustedRoiLimit = Math.max(0, roiLimit - commissionBonusTotal);
    const adjustedRemainingRoiCapacity = adjustedRoiLimit - currentRoiBalance;
    
    if (adjustedRemainingRoiCapacity <= 0) {
      return {
        allowed: false,
        actualAmount: 0,
        cappedAmount: requestedAmount,
        message: "ROI capacity exhausted due to existing commission/bonus earnings",
      };
    }
    
    maxAllowedAmount = Math.min(adjustedRemainingRoiCapacity, remainingTotalCapacity);
    */

    // Option 3: Current implementation - Allow ROI earning up to individual and total limits
    // (This is the most flexible approach)

    // Calculate actual amount (limited by both ROI limit and total limit)
    const maxAllowedAmount = Math.min(
      remainingRoiCapacity,
      remainingTotalCapacity
    );
    const actualAmount = Math.min(requestedAmount, maxAllowedAmount);
    const cappedAmount = requestedAmount - actualAmount;

    return {
      allowed: actualAmount > 0,
      actualAmount: actualAmount,
      cappedAmount: cappedAmount,
      message:
        cappedAmount > 0
          ? "ROI amount capped due to limits"
          : "ROI amount approved",
    };
  }
  // Validate commission/bonus earning
  validateCommissionEarning(
    currentTotalEarnings,
    requestedAmount,
    totalEarningsLimit
  ) {
    const remainingCapacity = totalEarningsLimit - currentTotalEarnings;

    // Check if already at total limit
    if (remainingCapacity <= 0) {
      return {
        allowed: false,
        actualAmount: 0,
        cappedAmount: requestedAmount,
        message: "Total earnings limit (4x investment) already reached",
      };
    }

    // Calculate actual amount
    const actualAmount = Math.min(requestedAmount, remainingCapacity);
    const cappedAmount = requestedAmount - actualAmount;

    return {
      allowed: actualAmount > 0,
      actualAmount: actualAmount,
      cappedAmount: cappedAmount,
      message:
        cappedAmount > 0
          ? "Commission/bonus amount capped due to limits"
          : "Commission/bonus amount approved",
    };
  }
  static async validateDailyEarningsLimit(userId, requestedAmount) {
    const limitSetting = await Transaction.initializeSettings();

    // Check if commission processing is enabled
    if (!limitSetting.enabled) {
      return {
        success: false,
        message: "Commission processing is disabled",
        processed_users: 0,
        total_commission_distributed: 0,
        transactions_created: 0,
      };
    }
    const DAILY_EARNINGS_LIMIT = limitSetting.limit || 200;
    const connection = await Database.getConnection();
    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    try {
      // Query to get total earnings for today
      const query = `
      SELECT COALESCE(SUM(amount), 0) as daily_total
      FROM transactions 
      WHERE user_id = ? 
        AND transaction_type IN ('level_commission', 'reward_bonus', 'direct_bonus', 'salary', 'roi_earning')
        AND status = 'completed'
        AND created_at >= ? 
        AND created_at < ?
    `;

      const [rows] = await connection.execute(query, [
        userId,
        startOfDay.toISOString(),
        endOfDay.toISOString(),
      ]);

      const currentDailyEarnings = parseFloat(rows[0]?.daily_total) || 0;
      const remainingLimit = DAILY_EARNINGS_LIMIT - currentDailyEarnings;

      // If already at or over the daily limit
      if (remainingLimit <= 0) {
        return {
          allowed: false,
          actualAmount: 0,
          cappedAmount: requestedAmount,
          message: `Daily earnings limit of ${DAILY_EARNINGS_LIMIT} reached. Current daily earnings: ${currentDailyEarnings}`,
          dailyEarnings: currentDailyEarnings,
          dailyLimit: DAILY_EARNINGS_LIMIT,
          remainingLimit: 0,
        };
      }

      // If requested amount exceeds remaining limit, cap it
      if (requestedAmount > remainingLimit) {
        return {
          allowed: true,
          actualAmount: remainingLimit,
          cappedAmount: requestedAmount - remainingLimit,
          message: `Amount capped to daily limit. Remaining daily limit: ${remainingLimit}`,
          dailyEarnings: currentDailyEarnings,
          dailyLimit: DAILY_EARNINGS_LIMIT,
          remainingLimit: remainingLimit,
        };
      }

      // Amount is within daily limit
      return {
        allowed: true,
        actualAmount: requestedAmount,
        cappedAmount: 0,
        message: "Within daily earnings limit",
        dailyEarnings: currentDailyEarnings,
        dailyLimit: DAILY_EARNINGS_LIMIT,
        remainingLimit: remainingLimit - requestedAmount,
      };
    } catch (error) {
      console.error("Error validating daily earnings limit:", error);
      throw new Error("Failed to validate daily earnings limit");
    }
  }

  // Create transaction
  async create(connection = null) {
    // Validate daily earnings limit for earning transactions
    const earningTypes = [
      "level_commission",
      "reward_bonus",
      "direct_bonus",
      "salary",
      "roi_earning",
    ];
    let validationResult = null;
    let originalAmount = this.amount;

    if (earningTypes.includes(this.transaction_type) && this.amount > 0) {
      validationResult = await Transaction.validateDailyEarningsLimit(
        this.user_id,
        this.amount
      );

      if (!validationResult.allowed) {
        throw new Error(`Transaction blocked: ${validationResult.message}`);
      }

      // Update amount if capped
      if (validationResult.actualAmount !== this.amount) {
        this.amount = validationResult.actualAmount;
        this.net_amount = validationResult.actualAmount;

        // Update admin notes with capping information
        const cappingNote = `Original amount: $${originalAmount}, Capped amount: $${validationResult.cappedAmount}`;
        this.admin_notes = this.admin_notes
          ? `${this.admin_notes}. ${cappingNote}`
          : cappingNote;
      }
    }

    // Don't create transaction if amount is 0 after validation
    if (this.amount <= 0) {
      return {
        success: false,
        transaction: null,
        message: validationResult?.message || "Transaction amount is 0",
        originalAmount: originalAmount,
        actualAmount: 0,
        cappedAmount: validationResult?.cappedAmount || 0,
      };
    }

    const sql = `
    INSERT INTO transactions (
      user_id, transaction_hash, reference_id, transaction_type, amount,
      fee_amount, net_amount, currency, status, related_user_id,
      related_investment_id, source_type, source_details, processed_by,
      processed_at, admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

    const params = [
      this.user_id,
      this.transaction_hash,
      this.reference_id,
      this.transaction_type,
      this.amount,
      this.fee_amount,
      this.net_amount,
      this.currency,
      this.status,
      this.related_user_id,
      this.related_investment_id,
      this.source_type,
      this.source_details,
      this.processed_by,
      this.processed_at,
      this.admin_notes,
    ];

    // Use provided connection or default to Database.query
    const result = connection
      ? await connection.execute(sql, params)
      : await Database.query(sql, params);

    this.id = result.insertId || result[0]?.insertId;
    return this;
  }

  // Find transaction by ID
  static async findById(id) {
    const sql = "SELECT * FROM transactions WHERE id = ?";
    const result = await Database.query(sql, [id]);
    return result.length > 0 ? new Transaction(result[0]) : null;
  }

  // Find transaction by hash
  static async findByHash(hash) {
    const sql = "SELECT * FROM transactions WHERE transaction_hash = ?";
    const result = await Database.query(sql, [hash]);
    return result.length > 0 ? new Transaction(result[0]) : null;
  }

  // Find transaction by reference ID
  static async findByReferenceId(referenceId) {
    const sql = "SELECT * FROM transactions WHERE reference_id = ?";
    const result = await Database.query(sql, [referenceId]);
    return result.length > 0 ? new Transaction(result[0]) : null;
  }

  static async getByUserId(userId, options = {}) {
    // Validate userId parameter
    if (userId === undefined || userId === null) {
      throw new Error("userId is required and cannot be undefined or null");
    }

    // Default options
    const {
      page = 1,
      limit = 10,
      transaction_type = null,
      status = null,
      currency = null,
      source_type = null,
      related_user_id = null,
      related_investment_id = null,
      date_from = null,
      date_to = null,
      min_amount = null,
      max_amount = null,
      reference_id = null,
      transaction_hash = null,
      order_by = "created_at",
      order_direction = "DESC",
    } = options;

    const offset = (page - 1) * limit;

    // Convert to proper types
    const userIdParam = parseInt(userId);
    const limitParam = parseInt(limit);
    const offsetParam = parseInt(offset);

    // Validate converted parameters
    if (isNaN(userIdParam) || userIdParam <= 0) {
      throw new Error(`Invalid userId: ${userId}`);
    }
    if (isNaN(limitParam) || limitParam <= 0) {
      throw new Error(`Invalid limit: ${limit}`);
    }
    if (isNaN(offsetParam) || offsetParam < 0) {
      throw new Error(`Invalid offset: ${offset}`);
    }

    // Validate order_by to prevent SQL injection
    const allowedOrderBy = [
      "id",
      "created_at",
      "updated_at",
      "amount",
      "net_amount",
      "transaction_type",
      "status",
      "processed_at",
    ];
    if (!allowedOrderBy.includes(order_by)) {
      throw new Error(`Invalid order_by field: ${order_by}`);
    }

    // Validate order_direction
    const orderDir = ["ASC", "DESC"].includes(order_direction.toUpperCase())
      ? order_direction.toUpperCase()
      : "DESC";

    // Build WHERE clause conditions
    let whereConditions = ["user_id = ?"];
    let queryParams = [userIdParam];

    // Add filtering conditions
    if (transaction_type) {
      whereConditions.push("transaction_type = ?");
      queryParams.push(transaction_type);
    }

    if (status) {
      whereConditions.push("status = ?");
      queryParams.push(status);
    }

    if (currency) {
      whereConditions.push("currency = ?");
      queryParams.push(currency);
    }

    if (source_type) {
      whereConditions.push("source_type = ?");
      queryParams.push(source_type);
    }

    if (related_user_id) {
      whereConditions.push("related_user_id = ?");
      queryParams.push(parseInt(related_user_id));
    }

    if (related_investment_id) {
      whereConditions.push("related_investment_id = ?");
      queryParams.push(parseInt(related_investment_id));
    }

    if (reference_id) {
      whereConditions.push("reference_id = ?");
      queryParams.push(reference_id);
    }

    if (transaction_hash) {
      whereConditions.push("transaction_hash = ?");
      queryParams.push(transaction_hash);
    }

    if (date_from) {
      whereConditions.push("created_at >= ?");
      queryParams.push(date_from);
    }

    if (date_to) {
      whereConditions.push("created_at <= ?");
      queryParams.push(date_to);
    }

    if (min_amount) {
      whereConditions.push("amount >= ?");
      queryParams.push(parseFloat(min_amount));
    }

    if (max_amount) {
      whereConditions.push("amount <= ?");
      queryParams.push(parseFloat(max_amount));
    }

    // Build the complete WHERE clause
    const whereClause = whereConditions.join(" AND ");
    // Build SQL queries
    const sql = `
    SELECT * FROM transactions 
    WHERE ${whereClause} 
    ORDER BY ${order_by} ${orderDir} 
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

    const countSql = `
    SELECT COUNT(*) as total FROM transactions 
    WHERE ${whereClause}
  `;

    try {
      const [transactions, countResult] = await Promise.all([
        Database.query(sql, queryParams),
        Database.query(countSql, queryParams),
      ]);

      // console.log(transactions)

      return {
        transactions: transactions.map((t) => new Transaction(t)),
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
        filters: {
          transaction_type,
          status,
          currency,
          source_type,
          related_user_id,
          related_investment_id,
          date_from,
          date_to,
          min_amount,
          max_amount,
          reference_id,
          transaction_hash,
          order_by,
          order_direction: orderDir,
        },
      };
    } catch (error) {
      console.error("Error in getByUserId:", error);
      throw error;
    }
  }

  // Get all transactions with pagination and filters
  static async getAll(page = 1, limit = 10, filters = {}) {
    try {
      // Ensure page and limit are integers and within valid ranges
      page = Math.max(1, parseInt(page) || 1);
      limit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Ensure filters is an object
      filters = filters || {};

      let sql = `
      SELECT t.*, u.username, u.email 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;

      const params = [];

      // Add filter conditions
      if (filters.user_id) {
        sql += " AND t.user_id = ?";
        params.push(parseInt(filters.user_id));
      }

      if (filters.transaction_type) {
        sql += " AND t.transaction_type = ?";
        params.push(filters.transaction_type);
      }

      if (filters.status) {
        sql += " AND t.status = ?";
        params.push(filters.status);
      }

      if (filters.source_type) {
        sql += " AND t.source_type = ?";
        params.push(filters.source_type);
      }

      if (filters.date_from) {
        sql += " AND t.created_at >= ?";
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += " AND t.created_at <= ?";
        params.push(filters.date_to);
      }

      if (filters.search) {
        sql +=
          " AND (t.transaction_hash LIKE ? OR t.reference_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Add ordering and pagination using string concatenation
      // This is safe because we've validated that limit and offset are integers
      const offset = (page - 1) * limit;
      sql += ` ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      console.log("SQL:", sql);
      console.log("Params:", params);

      // Execute main query
      const transactions = await Database.query(sql, params);

      // Get total count for pagination
      let countSql = `
      SELECT COUNT(*) as total 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;

      const countParams = [];

      // Add same filter conditions for count query
      if (filters.user_id) {
        countSql += " AND t.user_id = ?";
        countParams.push(parseInt(filters.user_id));
      }

      if (filters.transaction_type) {
        countSql += " AND t.transaction_type = ?";
        countParams.push(filters.transaction_type);
      }

      if (filters.status) {
        countSql += " AND t.status = ?";
        countParams.push(filters.status);
      }

      if (filters.source_type) {
        countSql += " AND t.source_type = ?";
        countParams.push(filters.source_type);
      }

      if (filters.date_from) {
        countSql += " AND t.created_at >= ?";
        countParams.push(filters.date_from);
      }

      if (filters.date_to) {
        countSql += " AND t.created_at <= ?";
        countParams.push(filters.date_to);
      }

      if (filters.search) {
        countSql +=
          " AND (t.transaction_hash LIKE ? OR t.reference_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const countResult = await Database.query(countSql, countParams);
      const total = countResult[0].total;

      return {
        transactions,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Transaction.getAll error:", error);
      throw error;
    }
  }

  // Update transaction
  async update() {
    const sql = `
      UPDATE transactions SET 
        transaction_type = ?, amount = ?, fee_amount = ?, net_amount = ?,
        currency = ?, status = ?, related_user_id = ?, related_investment_id = ?,
        source_type = ?, source_details = ?, processed_by = ?, processed_at = ?,
        admin_notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const params = [
      this.transaction_type,
      this.amount,
      this.fee_amount,
      this.net_amount,
      this.currency,
      this.status,
      this.related_user_id,
      this.related_investment_id,
      this.source_type,
      this.source_details,
      this.processed_by,
      this.processed_at,
      this.admin_notes,
      this.id,
    ];

    await Database.query(sql, params);
    return this;
  }

  // Update transaction status
  async updateStatus(status, processedBy = null, adminNotes = null) {
    this.status = status;
    this.processed_by = processedBy;
    this.processed_at = status === "completed" ? new Date() : this.processed_at;
    this.admin_notes = adminNotes || this.admin_notes;

    const sql = `
      UPDATE transactions SET 
        status = ?, processed_by = ?, processed_at = ?, admin_notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await Database.query(sql, [
      this.status,
      this.processed_by,
      this.processed_at,
      this.admin_notes,
      this.id,
    ]);
    return this;
  }

  // Get transaction statistics
  static async getStatistics(userId = null, dateFrom = null, dateTo = null) {
    let sql = `
    SELECT 
      COUNT(*) as total_transactions,
      SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as total_deposit,
      SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawal,
      SUM(CASE WHEN transaction_type = 'roi_earning' THEN amount ELSE 0 END) as total_roi_earning,
      SUM(CASE WHEN transaction_type = 'level_commission' THEN amount ELSE 0 END) as total_level_commission,
      SUM(CASE WHEN transaction_type = 'upline_commission' THEN amount ELSE 0 END) as total_upline_commission,
      SUM(CASE WHEN transaction_type = 'direct_bonus' THEN amount ELSE 0 END) as total_direct_bonus,
      SUM(CASE WHEN transaction_type = 'reward_bonus' THEN amount ELSE 0 END) as total_reward_bonus,
      SUM(CASE WHEN transaction_type = 'transfer_in' THEN amount ELSE 0 END) as total_transfer_in,
      SUM(CASE WHEN transaction_type = 'transfer_out' THEN amount ELSE 0 END) as total_transfer_out,
      SUM(CASE WHEN transaction_type = 'invest' THEN amount ELSE 0 END) as total_invest,
      SUM(CASE WHEN transaction_type = 'topup' THEN amount ELSE 0 END) as total_topup,
      SUM(CASE WHEN transaction_type = 'compound' THEN amount ELSE 0 END) as total_compound,
      SUM(CASE WHEN transaction_type = 'penalty' THEN amount ELSE 0 END) as total_penalty,
      SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) as total_refund,
      SUM(CASE WHEN transaction_type = 'salary' THEN amount ELSE 0 END) as total_salary,
      
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_transactions,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions
    FROM transactions 
    WHERE 1=1
  `;

    let params = [];

    if (userId) {
      sql += " AND user_id = ?";
      params.push(userId);
    }

    if (dateFrom) {
      sql += " AND DATE(created_at) >= ?";
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += " AND DATE(created_at) <= ?";
      params.push(dateTo);
    }

    const result = await Database.query(sql, params);
    return result[0];
  }

  // Delete transaction
  async delete() {
    const sql = "DELETE FROM transactions WHERE id = ?";
    await Database.query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      transaction_hash: this.transaction_hash,
      reference_id: this.reference_id,
      transaction_type: this.transaction_type,
      amount: parseFloat(this.amount),
      fee_amount: parseFloat(this.fee_amount),
      net_amount: parseFloat(this.net_amount),
      currency: this.currency,
      status: this.status,
      related_user_id: this.related_user_id,
      related_investment_id: this.related_investment_id,
      source_type: this.source_type,
      source_details: this.source_details,
      processed_by: this.processed_by,
      processed_at: this.processed_at,
      admin_notes: this.admin_notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Transaction;
