// services/CronService.js
const CommissionService = require("./level.service");
const ROI = require("./roi.proccess");
const Database = require('../database');

class CronService {
  constructor() {
    this.commissionService = new CommissionService();
    this.roiService = new ROI();
  }

  async processROI() {
    let connection;

    try {
      console.log("🔄 Starting ROI processing...");
      connection = await Database.getConnection();
      const roiProcessor = new ROI(connection);
      const result = await roiProcessor.processAllROI();

      if (result.success) {
        console.log("✅ ROI processing completed successfully");
        console.log(
          `📊 Summary: ${result.processed || 0} processed, ${
            result.failed || 0
          } failed, Total ROI: $${result.total_roi_amount?.toFixed(2) || 0}`
        );
      } else {
        console.log("⚠️ ROI processing skipped:", result.message);
      }
    } catch (error) {
      console.error("❌ ROI processing failed:", error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Daily cron job to process all commissions
   */
  async processDailyCommissions() {
    console.log("Starting daily commission processing...");

    try {
      // Process commissions for all users
      const result =
        await this.commissionService.calculateCommissionForAllUsers();

      if (result.success) {
        console.log("Daily commission processing completed successfully:", {
          processed_users: result.processed_users,
          total_commission_distributed: result.total_commission_distributed,
          transactions_created: result.transactions_created,
        });

        // Log the success to database
        await this.logCronExecution("daily_commission", "success", result);

        return result;
      } else {
        console.log("Daily commission processing was skipped:", result.message);
        await this.logCronExecution("daily_commission", "skipped", result);
        return result;
      }
    } catch (error) {
      console.error("Daily commission processing failed:", error);
      await this.logCronExecution("daily_commission", "error", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get commission settings
   */
  async getCommissionSettings() {
    try {
      await this.commissionService.initializeSettings();
      return this.commissionService.getCommissionSettings();
    } catch (error) {
      console.error("Error getting commission settings:", error);
      throw error;
    }
  }

  /**
   * Get user level information
   */
  async getUserLevelInfo(userId) {
    try {
      // First get user's direct referrals count
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await this.commissionService.initializeSettings();
      return this.commissionService.getUserLevelInfo(
        user.direct_referrals_count
      );
    } catch (error) {
      console.error("Error getting user level info:", error);
      throw error;
    }
  }

  /**
   * Process commission for a specific user (manual trigger)
   */
  async processUserCommission(userId) {
    console.log(`Processing commission for user ID: ${userId}`);
    let connection;

    try {
      // Initialize settings
      await this.commissionService.initializeSettings();

      // Check if commission processing is enabled
      const settings = this.commissionService.getCommissionSettings();
      if (!settings.enabled) {
        return {
          success: false,
          message: "Commission processing is disabled",
        };
      }

      connection = await Database.beginTransaction();

      // Get user data
      const users = await this.commissionService.fetchAllUsers(connection);
      const user = users.find((u) => u.id === userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "active") {
        throw new Error("User is not active");
      }

      // Get level configs and investments
      const levelConfigs = await this.commissionService.levelConfig.getAll(
        true
      );
      const investments = await this.commissionService.fetchActiveInvestments(
        connection
      );

      // Build user map and referral tree
      const userMap = this.commissionService.buildUserMap(users);
      const referralTree = this.commissionService.buildReferralTree(
        users,
        userMap
      );

      // Calculate user ROI
      const userROIMap = this.commissionService.calculateUserROI(investments);

      // Calculate commission for this specific user
      const commission = await this.commissionService.calculateUserCommission(
        user,
        levelConfigs,
        userROIMap,
        connection
      );

      if (commission > 0) {
        await this.commissionService.distributeCommission(
          user,
          commission,
          connection
        );

        await Database.commitTransaction(connection);

        console.log(`Commission processed for user ${userId}: ${commission}`);

        return {
          success: true,
          user_id: userId,
          commission_amount: commission,
          message: "Commission processed successfully",
        };
      } else {
        await Database.rollbackTransaction(connection);

        return {
          success: true,
          user_id: userId,
          commission_amount: 0,
          message: "No commission earned",
        };
      }
    } catch (error) {
      console.error(`Error processing commission for user ${userId}:`, error);
      
      if (connection) {
        await Database.rollbackTransaction(connection);
      }
      
      throw error;
    }
  }

  /**
   * Get referral tree for a user
   */
  async getUserReferralTree(referralCode, depth = 5) {
    try {
      return await this.commissionService.getReferralTree(referralCode, depth);
    } catch (error) {
      console.error("Error getting referral tree:", error);
      throw error;
    }
  }

  /**
   * Get full referral tree for a user
   */
  async getUserFullReferralTree(referralCode) {
    try {
      return await this.commissionService.getFullReferralTree(referralCode);
    } catch (error) {
      console.error("Error getting full referral tree:", error);
      throw error;
    }
  }

  /**
   * Helper method to get user by ID
   */
  async getUserById(userId) {
    try {
      const sql = `
        SELECT 
          u.id, 
          u.username, 
          u.referral_code, 
          u.referrer_id,
          u.status,
          (
            SELECT COUNT(*) 
            FROM users ref 
            WHERE ref.referrer_id = u.id 
            AND ref.status = 'active'
          ) as direct_referrals_count
        FROM users u
        WHERE u.id = ?
      `;

      const [rows] = await Database.query(sql, [userId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Log cron execution
   */
  async logCronExecution(jobName, status, result) {
    try {
      const sql = `
        INSERT INTO cron_logs (
          job_name, 
          status, 
          result, 
          executed_at
        ) VALUES (?, ?, ?, NOW())
      `;

      await Database.query(sql, [jobName, status, JSON.stringify(result)]);
    } catch (error) {
      console.error("Error logging cron execution:", error);
    }
  }

  /**
   * Schedule daily commission processing
   */
  scheduleCommissionProcessing() {
    try {
      // Using node-cron as an example
      const cron = require("node-cron");

      // Run daily at 12:00 AM
      cron.schedule("* * * * *", async () => {
        console.log("Running scheduled daily commission processing...");
        try {
          // await this.processDailyCommissions();
          // await this.processROI()
        } catch (error) {
          console.error("Scheduled commission processing failed:", error);
        }
      });

      console.log("Daily commission processing scheduled");
    } catch (error) {
      console.error("Error scheduling commission processing:", error);
    }
  }
}

module.exports = CronService;