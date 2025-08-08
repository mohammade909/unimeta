const cron = require("node-cron");
const express = require("express");
const database = require("../database"); // Import the Database singleton
const Transaction = require("../models/Transaction"); // Import your Transaction class

class RewardSalaryProcessor {
  constructor() {
    this.db = database; // Use the singleton database instance
    this.app = express();
    this.setupCronJobs();
  }

  /**
   * Setup cron jobs - runs daily at midnight
   */
  setupCronJobs() {
    // Run daily at 00:00 (midnight)
    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("Starting daily rewards processing...");
        await this.processAchievedRewards();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    // Optional: Run expired rewards cleanup at 1 AM
    cron.schedule(
      "0 1 * * *",
      async () => {
        console.log("Processing expired rewards...");
        await this.processExpiredRewards();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );
  }


  /**
   * Validate transaction data before processing
   */
  validateTransactionData(transactionData) {
    const errors = [];

    // Check required fields
    if (!transactionData.user_id || transactionData.user_id <= 0) {
      errors.push("Invalid user_id");
    }

    if (!transactionData.amount || transactionData.amount <= 0) {
      errors.push("Amount must be positive");
    }

    if (!transactionData.net_amount || transactionData.net_amount < 0) {
      errors.push("Net amount cannot be negative");
    }

    if (transactionData.fee_amount < 0) {
      errors.push("Fee amount cannot be negative");
    }

    // Check currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR'];
    if (!validCurrencies.includes(transactionData.currency)) {
      errors.push(`Invalid currency: ${transactionData.currency}`);
    }

    // Check transaction type (based on the ENUM from table structure)
    const validTypes = [
      'deposit', 'withdrawal', 'roi_earning', 'level_commission', 
      'direct_bonus', 'reward_bonus', 'transfer_in', 'transfer_out', 
      'invest', 'compound', 'penalty', 'refund', 'salary'
    ];
    if (!validTypes.includes(transactionData.transaction_type)) {
      errors.push(`Invalid transaction_type: ${transactionData.transaction_type}`);
    }

    // Check status (based on the ENUM from table structure)
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(transactionData.status)) {
      errors.push(`Invalid status: ${transactionData.status}`);
    }

    // Check source type (based on the ENUM from table structure)
    const validSourceTypes = ['wallet', 'bank', 'crypto', 'internal'];
    if (!validSourceTypes.includes(transactionData.source_type)) {
      errors.push(`Invalid source_type: ${transactionData.source_type}`);
    }

    // Check JSON validity for source_details (CRITICAL for transactions_chk_1)
    if (transactionData.source_details) {
      try {
        if (typeof transactionData.source_details === 'string') {
          JSON.parse(transactionData.source_details);
        } else if (typeof transactionData.source_details === 'object') {
          // If it's already an object, stringify it to ensure it's valid JSON
          JSON.stringify(transactionData.source_details);
        }
      } catch (e) {
        errors.push(`source_details must be valid JSON: ${e.message}`);
      }
    }

    // Check date is not in future (if processed_at is set)
    if (transactionData.processed_at) {
      const processedDate = new Date(transactionData.processed_at);
      const now = new Date();
      if (processedDate > now) {
        errors.push("Processed date cannot be in the future");
      }
    }

    return errors;
  }

  /**
   * Main method to process achieved rewards
   */
  async processAchievedRewards() {
    try {
  

      const achievedRewards = await this.getAchievedRewards();

      if (achievedRewards.length === 0) {
        console.log("No achieved rewards found.");
        return;
      }

      console.log(
        `Found ${achievedRewards.length} achieved rewards to process.`
      );

      const results = {
        successful: 0,
        failed: 0,
        blocked: 0,
        totalAmount: 0,
        details: [],
      };

      for (const reward of achievedRewards) {
        const result = await this.processReward(reward);
        results.details.push(result);

        if (result.success) {
          results.successful++;
          results.totalAmount += parseFloat(result.amount || 0);
        } else if (result.message && result.message.includes("limit")) {
          results.blocked++;
        } else {
          results.failed++;
        }
      }

      console.log(`Daily rewards processing completed:
        - Successful: ${results.successful}
        - Blocked (due to limits): ${results.blocked}
        - Failed: ${results.failed}
        - Total amount processed: ${results.totalAmount.toFixed(2)}`);

      return results;
    } catch (error) {
      console.error("Error processing achieved rewards:", error);
      throw error;
    }
  }

  /**
   * Get all achieved rewards (don't filter by claimed_at)
   */
  async getAchievedRewards() {
    const query = `
      SELECT 
        id,
        user_id,
        reward_program_id,
        current_progress,
        required_target,
        achievement_percentage,
        reward_amount,
        achieved_at,
        expires_at,
        status
      FROM user_rewards 
      WHERE status = 'achieved' 
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY achieved_at ASC
    `;

    try {
      const results = await this.db.query(query);
      return results;
    } catch (error) {
      console.error("Error fetching achieved rewards:", error);
      throw error;
    }
  }

  /**
   * Process individual reward using Transaction class
   */
  async processReward(reward) {
    try {
      // Create transaction data for the reward
      const now = new Date();
      const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // Ensure amount is positive and properly formatted
      const rewardAmount = Math.abs(parseFloat(reward.reward_amount));
      
      const transactionData = {
        user_id: parseInt(reward.user_id),
        transaction_type: "reward_bonus", // Using reward_bonus as transaction type
        amount: rewardAmount,
        fee_amount: 0.0,
        net_amount: rewardAmount,
        currency: "USD",
        status: "completed",
        source_type: "internal",
        source_details: JSON.stringify({
          type: "reward_processing",
          reward_program_id: reward.reward_program_id,
          description: `Reward from program ID: ${reward.reward_program_id}`,
          processed_automatically: true,
          processing_date: new Date().toISOString()
        }),
        admin_notes: `Auto-processed reward for achievement on ${reward.achieved_at}`,
        processed_by: 1,
        processed_at: mysqlDateTime, // Use MySQL-compatible datetime format
      };

      // Validate transaction data before processing
      const validationErrors = this.validateTransactionData(transactionData);
      if (validationErrors.length > 0) {
        console.error(`Validation errors for reward ${reward.id}:`, validationErrors);
        return {
          success: false,
          rewardId: reward.id,
          error: `Validation failed: ${validationErrors.join(', ')}`,
        };
      }

      console.log(`Processing reward ${reward.id} with data:`, JSON.stringify(transactionData, null, 2));

      // Create new Transaction instance
      const transaction = new Transaction(transactionData);

      // Create the transaction (this will handle daily limits and wallet validations)
      const result = await transaction.create();

      if (result && result.success !== false) {
        console.log(
          `Successfully created transaction for reward ${reward.id}, user ${reward.user_id}. Transaction ID: ${transaction.id}`
        );


        return {
          success: true,
          rewardId: reward.id,
          transactionId: transaction.id,
          amount: transaction.amount,
          originalAmount: reward.reward_amount,
        };
      } else {
        console.log(
          `Transaction creation blocked for reward ${reward.id}: ${result.message}`
        );
        return {
          success: false,
          rewardId: reward.id,
          message: result.message,
          originalAmount: reward.reward_amount,
          actualAmount: result.actualAmount || 0,
          cappedAmount: result.cappedAmount || 0,
        };
      }
    } catch (error) {
      console.error(`Error processing reward ${reward.id}:`, error);
      
      // Enhanced error logging for constraint violations
      if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        console.error(`CHECK CONSTRAINT VIOLATION for reward ${reward.id}:`);
        console.error(`SQL State: ${error.sqlState}`);
        console.error(`SQL Message: ${error.sqlMessage}`);
        console.error(`Constraint: ${error.sqlMessage}`);
        
        // Log the exact values being inserted
        console.error('Transaction data that failed:', {
          user_id: reward.user_id,
          amount: reward.reward_amount,
          transaction_type: "reward_bonus",
          status: "completed",
          currency: "USD"
        });
      }
      
      return {
        success: false,
        rewardId: reward.id,
        error: error.message,
        errorCode: error.code,
        constraintViolation: error.code === 'ER_CHECK_CONSTRAINT_VIOLATED'
      };
    }
  }

  /**
   * Update reward status to claimed
   */
  async updateRewardStatus(rewardId, status) {
    const updateQuery = `
      UPDATE user_rewards 
      SET 
        status = ?,
        claimed_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `;

    try {
      const result = await this.db.query(updateQuery, [status, rewardId]);
      console.log(`Updated reward ${rewardId} status to ${status}`);
      return result;
    } catch (error) {
      console.error(`Error updating reward ${rewardId} status:`, error);
      throw error;
    }
  }

  /**
   * Check for expired rewards and update their status
   */
  async processExpiredRewards() {
    const updateQuery = `
      UPDATE user_rewards 
      SET 
        status = 'expired',
        updated_at = NOW()
      WHERE status IN ('achieved', 'active') 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
    `;

    try {
      const result = await this.db.query(updateQuery);
      console.log(`Updated ${result.affectedRows || 0} expired rewards.`);
      return result;
    } catch (error) {
      console.error("Error processing expired rewards:", error);
      throw error;
    }
  }

  /**
   * Generate daily rewards report
   */
  async generateDailyReport() {
    const reportQuery = `
      SELECT 
        COUNT(*) as total_processed,
        SUM(amount) as total_amount,
        DATE(created_at) as process_date
      FROM transactions 
      WHERE DATE(created_at) = CURDATE()
        AND transaction_type = 'reward_bonus'
        AND source_type = 'internal'
        AND status = 'completed'
      GROUP BY DATE(created_at)
    `;

    try {
      const report = await this.db.query(reportQuery);
      console.log("Daily Rewards Report:", report);
      return report;
    } catch (error) {
      console.error("Error generating daily report:", error);
      throw error;
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(days = 7) {
    const statsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND transaction_type = 'reward_bonus'
        AND source_type = 'internal'
        AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    try {
      const stats = await this.db.query(statsQuery, [days]);
      console.log(`Rewards processing stats for last ${days} days:`, stats);
      return stats;
    } catch (error) {
      console.error("Error getting processing stats:", error);
      throw error;
    }
  }

}

module.exports = RewardSalaryProcessor;