// models/WithdrawalRequest.js
const db = require("../database");
const UplineRewardService = require("../service/upline.service");

class WithdrawalRequest {
  // Create new withdrawal request
  static async create(withdrawalData) {
    const {
      user_id,
      requested_amount,
      fee_amount,
      net_amount,
      withdrawal_method,
      withdrawalType,
      withdrawal_details,
    } = withdrawalData;

    console.log("Creating withdrawal request:", withdrawalData);
    
    const sql = `
      INSERT INTO withdrawal_requests 
      (user_id, requested_amount, fee_amount, net_amount, withdrawal_method, withdrawal_type, withdrawal_details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user_id,
      requested_amount,
      fee_amount,
      net_amount,
      withdrawal_method,
      withdrawalType,
      JSON.stringify(withdrawal_details),
    ];

    const result = await db.query(sql, params);
    return { id: result.insertId, ...withdrawalData };
  }

  // Get withdrawal by ID
  static async findById(id) {
    const sql = `
      SELECT wr.*, u.username, u.email, 
             admin.username as processed_by_name
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      LEFT JOIN users admin ON wr.processed_by = admin.id
      WHERE wr.id = ?
    `;

    const result = await db.query(sql, [id]);
    return result[0] || null;
  }

  // Get user's withdrawal requests
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    const sql = `
      SELECT * FROM withdrawal_requests 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    const results = await db.queryWithLimitOffset(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM withdrawal_requests ${whereClause}`;
    const countResult = await db.query(countSql, params.slice(0, -2));

    return {
      withdrawals: results,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      user_id,
      withdrawalType,
      includeStats = true,
    } = options;
    const offset = (page - 1) * limit;

    let whereClause = "";
    let params = [];

    const conditions = [];

    if (status) {
      conditions.push("wr.status = ?");
      params.push(status);
    }

    if (user_id) {
      conditions.push("wr.user_id = ?");
      params.push(user_id);
    }

    if (withdrawalType) {
      conditions.push("wr.withdrawal_type = ?");
      params.push(withdrawalType);
    }

    if (conditions.length > 0) {
      whereClause = "WHERE " + conditions.join(" AND ");
    }

    // Main query for withdrawals
    const sql = `
    SELECT wr.*, u.username, u.email,
           admin.username as processed_by_name,
           uwa.wallet_type, uwa.wallet_address, uwa.is_verified as wallet_verified
    FROM withdrawal_requests wr
    LEFT JOIN users u ON wr.user_id = u.id
    LEFT JOIN users admin ON wr.processed_by = admin.id
    LEFT JOIN user_wallet_addresses uwa ON wr.user_id = uwa.user_id AND uwa.is_primary = 1
    ${whereClause}
    ORDER BY wr.created_at DESC
    LIMIT ? OFFSET ?
  `;

    params.push(parseInt(limit), parseInt(offset));

    const results = await db.queryWithLimitOffset(sql, params);

    // Get total count
    const countSql = `
    SELECT COUNT(*) as total 
    FROM withdrawal_requests wr
    LEFT JOIN users u ON wr.user_id = u.id
    LEFT JOIN user_wallet_addresses uwa ON wr.user_id = uwa.user_id AND uwa.is_primary = 1
    ${whereClause}
  `;
    const countResult = await db.query(countSql, params.slice(0, -2));

    const response = {
      withdrawals: results,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };

    // Add financial statistics if requested
    if (includeStats) {
      response.statistics = await this.getFinanceStats(options);
    }

    return response;
  }

  static async getFinanceStats(options = {}) {
    const { withdrawalType, status } = options;

    let whereClause = "";
    let params = [];
    const conditions = [];

    if (withdrawalType) {
      conditions.push("withdrawal_type = ?");
      params.push(withdrawalType);
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (conditions.length > 0) {
      whereClause = "WHERE " + conditions.join(" AND ");
    }

    // Get total statistics
    const totalSql = `
    SELECT 
      COUNT(*) as total_count,
      COALESCE(SUM(requested_amount), 0) as total_amount,
      COALESCE(SUM(fee_amount), 0) as total_fees,
      COALESCE(SUM(net_amount), 0) as total_net_amount
    FROM withdrawal_requests
    ${whereClause}
  `;

    // Get pending totals
    const pendingSql = `
    SELECT 
      COUNT(*) as pending_count,
      COALESCE(SUM(requested_amount), 0) as pending_amount,
      COALESCE(SUM(fee_amount), 0) as pending_fees,
      COALESCE(SUM(net_amount), 0) as pending_net_amount
    FROM withdrawal_requests
    WHERE status = 'pending'
    ${withdrawalType ? "AND withdrawal_type = ?" : ""}
  `;

    // Get completed totals
    const completedSql = `
    SELECT 
      COUNT(*) as completed_count,
      COALESCE(SUM(requested_amount), 0) as completed_amount,
      COALESCE(SUM(fee_amount), 0) as completed_fees,
      COALESCE(SUM(net_amount), 0) as completed_net_amount
    FROM withdrawal_requests
    WHERE status = 'completed'
    ${withdrawalType ? "AND withdrawal_type = ?" : ""}
  `;

    try {
      const [totalStats, pendingStats, completedStats] = await Promise.all([
        db.query(totalSql, params),
        db.query(pendingSql, withdrawalType ? [withdrawalType] : []),
        db.query(completedSql, withdrawalType ? [withdrawalType] : []),
      ]);

      const total = totalStats[0] || {};
      const pending = pendingStats[0] || {};
      const completed = completedStats[0] || {};

      // Format the response with only totals
      const result = {
        total_count: parseInt(total.total_count) || 0,
        total_amount: parseFloat(total.total_amount) || 0,
        total_fees: parseFloat(total.total_fees) || 0,
        total_net_amount: parseFloat(total.total_net_amount) || 0,
        pending_count: parseInt(pending.pending_count) || 0,
        pending_amount: parseFloat(pending.pending_amount) || 0,
        pending_fees: parseFloat(pending.pending_fees) || 0,
        pending_net_amount: parseFloat(pending.pending_net_amount) || 0,
        completed_count: parseInt(completed.completed_count) || 0,
        completed_amount: parseFloat(completed.completed_amount) || 0,
        completed_fees: parseFloat(completed.completed_fees) || 0,
        completed_net_amount: parseFloat(completed.completed_net_amount) || 0,
      };

      return result;
    } catch (error) {
      console.error("Error fetching finance statistics:", error);
      return {
        total_count: 0,
        total_amount: 0,
        total_fees: 0,
        total_net_amount: 0,
        pending_count: 0,
        pending_amount: 0,
        pending_fees: 0,
        pending_net_amount: 0,
        completed_count: 0,
        completed_amount: 0,
        completed_fees: 0,
        completed_net_amount: 0,
      };
    }
  }
  /**
   * Get withdrawal statistics by specific type only
   */
  static async getStatsByType(withdrawalType) {
    const sql = `
    SELECT 
      wr.status,
      COUNT(*) as count,
      COALESCE(SUM(wr.amount), 0) as total_amount,
      COALESCE(SUM(wr.fee_amount), 0) as total_fees,
      COALESCE(SUM(wr.net_amount), 0) as total_net_amount,
      COALESCE(AVG(wr.amount), 0) as average_amount,
      MIN(wr.created_at) as first_request,
      MAX(wr.created_at) as last_request
    FROM withdrawal_requests wr
    WHERE wr.withdrawal_type = ?
    GROUP BY wr.status
  `;

    try {
      const results = await db.query(sql, [withdrawalType]);

      const stats = {
        withdrawal_type: withdrawalType,
        by_status: results || [],
        totals: {
          total_requests: results.reduce((sum, row) => sum + row.count, 0),
          total_amount: results.reduce(
            (sum, row) => sum + parseFloat(row.total_amount),
            0
          ),
          total_fees: results.reduce(
            (sum, row) => sum + parseFloat(row.total_fees),
            0
          ),
          total_net_amount: results.reduce(
            (sum, row) => sum + parseFloat(row.total_net_amount),
            0
          ),
        },
      };

      return stats;
    } catch (error) {
      console.error(
        `Error fetching stats for withdrawal type ${withdrawalType}:`,
        error
      );
      return {
        withdrawal_type: withdrawalType,
        by_status: [],
        totals: {
          total_requests: 0,
          total_amount: 0,
          total_fees: 0,
          total_net_amount: 0,
        },
      };
    }
  }

  // static async update(id, updateData) {
  //   const connection = await db.getConnection();

  //   try {
  //     await connection.beginTransaction();

  //     const fields = [];
  //     const params = [];

  //     Object.keys(updateData).forEach((key) => {
  //       if (updateData[key] !== undefined) {
  //         fields.push(`${key} = ?`);
  //         params.push(updateData[key]);
  //       }
  //     });

  //     if (fields.length === 0) {
  //       throw new Error("No fields to update");
  //     }

  //     params.push(id);

  //     const sql = `
  //     UPDATE withdrawal_requests
  //     SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
  //     WHERE id = ?
  //   `;

  //     await connection.query(sql, params);

  //     // Get the updated withdrawal request
  //     const updatedWithdrawal = await this.findById(id, connection);

  //     // Check if status was updated to 'approved' and create transaction
  //     if (updateData.status === "completed") {
  //       const Transaction = require("./Transaction");

  //       const transaction = new Transaction({
  //         user_id: updatedWithdrawal.user_id,
  //         transaction_type: "withdrawal",
  //         transaction_hash: updateData.transaction_hash,
  //         amount: updatedWithdrawal.requested_amount,
  //         fee_amount: updatedWithdrawal.fee_amount || 0,
  //         net_amount:
  //           updatedWithdrawal.amount - (updatedWithdrawal.fee_amount || 0),
  //         currency: updatedWithdrawal.currency || "USD",
  //         status: "completed",
  //         related_user_id: updatedWithdrawal.user_id,
  //         related_withdrawal_id: id,
  //         source_type: "internal",
  //         source_details: JSON.stringify({
  //           withdrawal_request_id: id,
  //           approved_at: new Date(),
  //           approval_type: "withdrawal_approval",
  //         }),
  //         processed_by: updateData.processed_by || 1,
  //         processed_at: new Date(),
  //         admin_notes: updateData.admin_notes || null,
  //       });

  //       try {
  //         await transaction.create(connection);
  //         console.log("Transaction created with ID:", transaction.id);
  //       } catch (transactionError) {
  //         console.error("Transaction creation error:", transactionError);
  //         throw new Error(
  //           `Failed to create transaction: ${transactionError.message}`
  //         );
  //       }
  //     }

  //     await connection.commit();
  //     return updatedWithdrawal;
  //   } catch (error) {
  //     await connection.rollback();
  //     throw error;
  //   } finally {
  //     connection.release();
  //   }
  // }

  static async update(id, updateData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const fields = [];
      const params = [];

      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          params.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      params.push(id);

      const sql = `
      UPDATE withdrawal_requests 
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

      await connection.query(sql, params);

      // Get the updated withdrawal request
      const updatedWithdrawal = await this.findById(id, connection);

      // Check if status was updated to 'completed' and create transaction
      if (updateData.status === "completed") {
        const Transaction = require("./Transaction");

        const transaction = new Transaction({
          user_id: updatedWithdrawal.user_id,
          transaction_type: "withdrawal",
          transaction_hash: updateData.transaction_hash,
          amount: updatedWithdrawal.requested_amount,
          fee_amount: updatedWithdrawal.fee_amount || 0,
          net_amount:
            updatedWithdrawal.amount - (updatedWithdrawal.fee_amount || 0),
          currency: updatedWithdrawal.currency || "USD",
          status: "completed",
          related_user_id: updatedWithdrawal.user_id,
          related_withdrawal_id: id,
          source_type: "internal",
          source_details: JSON.stringify({
            withdrawal_request_id: id,
            approved_at: new Date(),
            approval_type: "withdrawal_approval",
          }),
          processed_by: updateData.processed_by || 1,
          processed_at: new Date(),
          admin_notes: updateData.admin_notes || null,
        });

        try {
          await transaction.create(connection);
          console.log("Transaction created with ID:", transaction.id);

          // **NEW: Distribute upline rewards after successful withdrawal**
          await this.handleUplineRewards(
            connection,
            updatedWithdrawal.user_id,
            updatedWithdrawal.requested_amount,
            id
          );
        } catch (transactionError) {
          console.error("Transaction creation error:", transactionError);
          throw new Error(
            `Failed to create transaction: ${transactionError.message}`
          );
        }
      }

      await connection.commit();
      return updatedWithdrawal;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  static async handleUplineRewards(
    connection,
    userId,
    withdrawalAmount,
    withdrawalRequestId
  ) {
    try {
      console.log(
        `Starting upline reward distribution for withdrawal ${withdrawalRequestId}, user ${userId}, amount: $${withdrawalAmount}`
      );

      const uplineService = new UplineRewardService();

      // Distribute upline rewards based on withdrawal amount
      const result = await uplineService.distributeUplineRewards(
        userId,
        parseFloat(withdrawalAmount),
        "withdrawal_upline_reward",
        `Upline reward distribution for withdrawal completion. Withdrawal ID: ${withdrawalRequestId}, Amount: $${withdrawalAmount}`
      );

      if (result.success) {
        console.log(
          `Upline rewards distributed successfully for withdrawal ${withdrawalRequestId}:`,
          {
            totalDistributed: result.totalDistributed,
            rewardsCount: result.rewardsDistributed.length,
            processedLevels: result.processedLevels,
          }
        );

        // Log individual rewards for tracking
        result.rewardsDistributed.forEach((reward) => {
          console.log(
            `Withdrawal Upline Reward - Level ${reward.level}: $${reward.amount} to user ${reward.userId} (${reward.percentage}%)`
          );
        });

        // Log any users who didn't qualify
        if (result.errors.length > 0) {
          console.log(
            `Users who didn't qualify for withdrawal upline rewards (Withdrawal ID: ${withdrawalRequestId}):`
          );
          result.errors.forEach((error) => {
            console.log(
              `Level ${error.level} - User ${error.userId}: ${error.error}`
            );
          });
        }
      } else {
        console.error(
          `Failed to distribute upline rewards for withdrawal ${withdrawalRequestId}:`,
          result.error
        );

        // Don't throw error here - withdrawal should still complete even if upline rewards fail
        // Just log the error for manual review
        console.error(
          "Upline reward distribution failed, but withdrawal will still be processed"
        );
      }
    } catch (error) {
      console.error(
        `Error in handleUplineRewards for withdrawal ${withdrawalRequestId}:`,
        error
      );

      // Don't throw error here - withdrawal should still complete even if upline rewards fail
      // Just log the error for manual review
      console.error(
        "Upline reward distribution encountered an error, but withdrawal will still be processed"
      );
    }
  }

  // Get withdrawal statistics
  static async getStats(options = {}) {
    const { user_id, date_from, date_to } = options;

    let whereClause = "";
    let params = [];

    const conditions = [];

    if (user_id) {
      conditions.push("user_id = ?");
      params.push(user_id);
    }

    if (date_from) {
      conditions.push("created_at >= ?");
      params.push(date_from);
    }

    if (date_to) {
      conditions.push("created_at <= ?");
      params.push(date_to);
    }

    if (conditions.length > 0) {
      whereClause = "WHERE " + conditions.join(" AND ");
    }

    const sql = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        SUM(requested_amount) as total_requested,
        SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) as total_completed,
        SUM(fee_amount) as total_fees,
        AVG(requested_amount) as avg_request_amount
      FROM withdrawal_requests
      ${whereClause}
    `;

    const result = await db.query(sql, params);
    return result[0];
  }
}

module.exports = WithdrawalRequest;
