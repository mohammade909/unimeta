// services/WeeklySalaryProcessor.js
const Database = require("../database");
const SystemSettings = require("../models/SystemSettings");
const Transaction = require("../models/Transaction");

class WeeklySalaryProcessor {
  constructor() {
    this.systemSettings = typeof SystemSettings === 'string' ? JSON.parse(SystemSettings) : SystemSettings;
  }


  /**
   * Process weekly salary for all eligible users
   */
  async processWeeklySalaryForAllUsers() {
    const connection = await Database.getConnection();
    
    try {
      await connection.beginTransaction();
      
      console.log("Starting weekly salary processing...");
      
      // Get week salary settings
      const weeklySalarySetting = await this.systemSettings.findByKey("week_salary");
      
      if (!weeklySalarySetting) {
        throw new Error("Weekly salary settings not found");
      }

      console.log("setting",weeklySalarySetting)
      const salaryConfig = weeklySalarySetting.setting_value;
      
      if (!salaryConfig.enabled) {
        console.log("Weekly salary processing is disabled");
        return { success: true, message: "Weekly salary processing is disabled", processed: 0 };
      }

      // Get all users with achieved rewards
      const eligibleUsers = await this.getEligibleUsers(connection);
      
      if (eligibleUsers.length === 0) {
        console.log("No eligible users found for weekly salary");
        await connection.commit();
        return { success: true, message: "No eligible users found", processed: 0 };
      }

      const processedUsers = [];
      let totalProcessed = 0;

      for (const user of eligibleUsers) {
        try {
          const result = await this.processUserWeeklySalary(user, salaryConfig, connection);
          if (result.success) {
            processedUsers.push({
              user_id: user.user_id,
              level: user.level,
              amount: result.amount,
              transaction_id: result.transaction_id
            });
            totalProcessed++;
          }
        } catch (userError) {
          console.error(`Error processing user ${user.user_id}:`, userError.message);
          // Continue processing other users
        }
      }

      await connection.commit();
      
      console.log(`Weekly salary processing completed. Processed ${totalProcessed} users.`);
      
      return {
        success: true,
        message: `Successfully processed ${totalProcessed} users`,
        processed: totalProcessed,
        users: processedUsers
      };

    } catch (error) {
      await connection.rollback();
      console.error("Error in weekly salary processing:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all eligible users with achieved rewards
   */
  async getEligibleUsers(connection = null) {
    const sql = `
      SELECT DISTINCT 
        ur.user_id,
        ur.id as user_reward_id,
        rp.level,
        rp.reward_amount,
        rp.title as program_title,
        u.username,
        u.email,
        ur.achieved_at,
        ur.expires_at,
        DATEDIFF(NOW(), ur.achieved_at) as days_since_achieved,
        FLOOR(DATEDIFF(NOW(), ur.achieved_at) / 7) as weeks_since_achieved
      FROM user_rewards ur
      INNER JOIN reward_programs rp ON ur.reward_program_id = rp.id
      INNER JOIN users u ON ur.user_id = u.id
      WHERE ur.status = 'achieved'
        AND rp.is_active = 1
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND rp.level IS NOT NULL
        AND ur.achieved_at IS NOT NULL
        AND DATEDIFF(NOW(), ur.achieved_at) <= 140  -- 20 weeks = 140 days
      ORDER BY ur.user_id, rp.level DESC
    `;

    const results = connection 
      ? await connection.execute(sql)
      : await Database.query(sql);

    return connection ? results[0] : results;
  }

  /**
   * Process weekly salary for a specific user
   */
  async processUserWeeklySalary(user, salaryConfig, connection) {
    try {
      // Check if user is still within 20 weeks limit
      if (user.weeks_since_achieved >= 20) {
        return {
          success: false,
          message: `User ${user.user_id} exceeded 20 weeks limit (${user.weeks_since_achieved} weeks since achieved)`
        };
      }

      // Get the salary amount based on user's level
      const salaryAmount = this.getSalaryAmountByLevel(user.level, salaryConfig);
      
      if (salaryAmount <= 0) {
        return {
          success: false,
          message: `No salary configured for level ${user.level}`
        };
      }

      // Check if user already received weekly salary recently
      const hasRecentSalary = await this.hasRecentWeeklySalary(user.user_id, connection);
      
      if (hasRecentSalary) {
        return {
          success: false,
          message: `User ${user.user_id} already received weekly salary recently`
        };
      }

      // Create transaction for weekly salary
      const transaction = new Transaction({
        user_id: user.user_id,
        transaction_type: 'salary',
        amount: salaryAmount,
        fee_amount: 0.0,
        net_amount: salaryAmount,
        currency: 'USD',
        status: 'completed',
        source_type: 'internal',
        source_details: JSON.stringify({
          reward_level: user.level,
          program_title: user.program_title,
          user_reward_id: user.user_reward_id,
          achieved_at: user.achieved_at,
          weeks_since_achieved: user.weeks_since_achieved,
          processed_date: new Date().toISOString()
        }),
        processed_by: 1,
        processed_at: new Date(),
        admin_notes: `Weekly salary for level ${user.level} - ${user.program_title} (Week ${user.weeks_since_achieved + 1}/20)`
      });

      await transaction.create(connection);

      // Update user balance
    //   await this.updateUserBalance(user.user_id, salaryAmount, connection);

      // Log the transaction
      console.log(`Weekly salary processed for user ${user.user_id}: ${salaryAmount} (Level ${user.level}, Week ${user.weeks_since_achieved + 1}/20)`);

      return {
        success: true,
        amount: salaryAmount,
        transaction_id: transaction.id,
        level: user.level,
        weeks_since_achieved: user.weeks_since_achieved,
        weeks_remaining: 19 - user.weeks_since_achieved
      };

    } catch (error) {
      console.error(`Error processing weekly salary for user ${user.user_id}:`, error.message);
      throw error;
    }
  }

  /**
   * Get salary amount based on user level
   */
  getSalaryAmountByLevel(level, salaryConfig) {
    // Convert level to string to match the config keys
    const levelKey = level.toString();
    
    if (salaryConfig.hasOwnProperty(levelKey)) {
      return parseFloat(salaryConfig[levelKey]) || 0;
    }

    // If exact level not found, try to find the highest level less than or equal to user's level
    const availableLevels = Object.keys(salaryConfig)
      .filter(key => key !== 'enabled' && !isNaN(key))
      .map(key => parseInt(key))
      .sort((a, b) => b - a); // Sort descending

    for (const availableLevel of availableLevels) {
      if (availableLevel <= level) {
        return parseFloat(salaryConfig[availableLevel.toString()]) || 0;
      }
    }

    return 0;
  }

  /**
   * Check if user received weekly salary in the last 7 days
   */
  async hasRecentWeeklySalary(userId, connection) {
    const sql = `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE user_id = ?
        AND source_type = 'weekly_salary'
        AND status = 'completed'
        AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;

    const results = connection 
      ? await connection.execute(sql, [userId])
      : await Database.query(sql, [userId]);

    const count = connection ? results[0][0].count : results[0].count;
    return count > 0;
  }

  /**
   * Update user balance after salary credit
   */
  async updateUserBalance(userId, amount, connection) {
    const sql = `
      UPDATE users 
      SET balance = COALESCE(balance, 0) + ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    if (connection) {
      await connection.execute(sql, [amount, userId]);
    } else {
      await Database.query(sql, [amount, userId]);
    }
  }

  /**
   * Process weekly salary for a specific user by ID
   */
  async processWeeklySalaryForUser(userId) {
    const connection = await Database.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get week salary settings
      const weeklySalarySetting = await this.systemSettings.findByKey("week_salary");
      
      if (!weeklySalarySetting) {
        throw new Error("Weekly salary settings not found");
      }

      const salaryConfig = JSON.parse(weeklySalarySetting.setting_value);
      
      if (!salaryConfig.enabled) {
        throw new Error("Weekly salary processing is disabled");
      }

      // Get user's achieved rewards
      const sql = `
        SELECT DISTINCT 
          ur.user_id,
          ur.id as user_reward_id,
          rp.level,
          rp.reward_amount,
          rp.title as program_title,
          u.username,
          u.email,
          ur.achieved_at,
          ur.expires_at,
          DATEDIFF(NOW(), ur.achieved_at) as days_since_achieved,
          FLOOR(DATEDIFF(NOW(), ur.achieved_at) / 7) as weeks_since_achieved
        FROM user_rewards ur
        INNER JOIN reward_programs rp ON ur.reward_program_id = rp.id
        INNER JOIN users u ON ur.user_id = u.id
        WHERE ur.user_id = ?
          AND ur.status = 'achieved'
          AND rp.is_active = 1
          AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          AND rp.level IS NOT NULL
          AND ur.achieved_at IS NOT NULL
          AND DATEDIFF(NOW(), ur.achieved_at) <= 140  -- 20 weeks = 140 days
        ORDER BY rp.level DESC
        LIMIT 1
      `;

      const results = await connection.execute(sql, [userId]);
      const users = results[0];

      if (users.length === 0) {
        throw new Error(`No eligible rewards found for user ${userId} or user exceeded 20 weeks limit`);
      }

      const user = users[0];
      const result = await this.processUserWeeklySalary(user, salaryConfig, connection);

      await connection.commit();
      
      return result;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get weekly salary statistics
   */
  async getWeeklySalaryStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(created_at) as first_payment,
        MAX(created_at) as last_payment
      FROM transactions
      WHERE source_type = 'weekly_salary'
        AND status = 'completed'
        AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const results = await Database.query(sql);
    return results[0];
  }

  /**
   * Get users approaching 20-week limit (within last 2 weeks)
   */
  async getUsersApproachingLimit() {
    const sql = `
      SELECT 
        ur.user_id,
        u.username,
        u.email,
        rp.level,
        rp.title as program_title,
        ur.achieved_at,
        DATEDIFF(NOW(), ur.achieved_at) as days_since_achieved,
        FLOOR(DATEDIFF(NOW(), ur.achieved_at) / 7) as weeks_since_achieved,
        (20 - FLOOR(DATEDIFF(NOW(), ur.achieved_at) / 7)) as weeks_remaining
      FROM user_rewards ur
      INNER JOIN reward_programs rp ON ur.reward_program_id = rp.id
      INNER JOIN users u ON ur.user_id = u.id
      WHERE ur.status = 'achieved'
        AND rp.is_active = 1
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND rp.level IS NOT NULL
        AND ur.achieved_at IS NOT NULL
        AND DATEDIFF(NOW(), ur.achieved_at) BETWEEN 126 AND 140  -- 18-20 weeks (last 2 weeks)
      ORDER BY weeks_since_achieved DESC
    `;

    const results = await Database.query(sql);
    return results;
  }

  /**
   * Get users who have exceeded the 20-week limit
   */
  async getUsersExceededLimit() {
    const sql = `
      SELECT 
        ur.user_id,
        u.username,
        u.email,
        rp.level,
        rp.title as program_title,
        ur.achieved_at,
        DATEDIFF(NOW(), ur.achieved_at) as days_since_achieved,
        FLOOR(DATEDIFF(NOW(), ur.achieved_at) / 7) as weeks_since_achieved
      FROM user_rewards ur
      INNER JOIN reward_programs rp ON ur.reward_program_id = rp.id
      INNER JOIN users u ON ur.user_id = u.id
      WHERE ur.status = 'achieved'
        AND rp.is_active = 1
        AND rp.level IS NOT NULL
        AND ur.achieved_at IS NOT NULL
        AND DATEDIFF(NOW(), ur.achieved_at) > 140  -- More than 20 weeks
      ORDER BY weeks_since_achieved DESC
    `;

    const results = await Database.query(sql);
    return results;
  }
}

module.exports = WeeklySalaryProcessor;

// Example usage and scheduler setup:

/*
// schedulers/weeklySalaryScheduler.js
const cron = require('node-cron');
const WeeklySalaryProcessor = require('../services/WeeklySalaryProcessor');

class WeeklySalaryScheduler {
  static start() {
    const processor = new WeeklySalaryProcessor();
    
    // Run every Sunday at 12:00 AM (weekly)
    cron.schedule('0 0 * * 0', async () => {
      console.log('Starting weekly salary processing...');
      try {
        const result = await processor.processWeeklySalaryForAllUsers();
        console.log('Weekly salary processing result:', result);
      } catch (error) {
        console.error('Weekly salary processing failed:', error.message);
      }
    });
    
    console.log('Weekly salary scheduler started');
  }
}

module.exports = WeeklySalaryScheduler;
*/

/*
// controllers/weeklySalaryController.js
const WeeklySalaryProcessor = require('../services/WeeklySalaryProcessor');

class WeeklySalaryController {
  // Manual trigger for processing all users
  static async processAllUsers(req, res) {
    try {
      const processor = new WeeklySalaryProcessor();
      const result = await processor.processWeeklySalaryForAllUsers();
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Process specific user
  static async processUser(req, res) {
    try {
      const { userId } = req.params;
      const processor = new WeeklySalaryProcessor();
      const result = await processor.processWeeklySalaryForUser(parseInt(userId));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get weekly salary statistics
  static async getStats(req, res) {
    try {
      const processor = new WeeklySalaryProcessor();
      const stats = await processor.getWeeklySalaryStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users approaching limit
  static async getUsersApproachingLimit(req, res) {
    try {
      const processor = new WeeklySalaryProcessor();
      const users = await processor.getUsersApproachingLimit();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get users who exceeded limit
  static async getUsersExceededLimit(req, res) {
    try {
      const processor = new WeeklySalaryProcessor();
      const users = await processor.getUsersExceededLimit();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = WeeklySalaryController;
*/