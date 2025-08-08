const database = require("../database"); // Import the database instance

class UserDashboard {
  constructor() {
    // Use the database query method from the database.js file
    this.db = database;
  }

  /**
   * Get comprehensive user dashboard statistics
   */
  async getUserDashboardStats(userId, date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];

    try {
      // Execute all queries in parallel for better performance
      const [
        userInfo,
        dailyStats,
        investmentStats,
        teamStats,
        recentTransactions,
        rewardProgress,
        monthlyStats,
        stats,
      ] = await Promise.all([
        this.getUserBasicInfo(userId),
        this.getDailyStats(userId, targetDate),
        this.getInvestmentStats(userId),
        this.getTeamStats(userId),
        this.getRecentTransactions(userId, 10),
        this.getRewardProgress(userId),
        this.getMonthlyStats(userId, targetDate),
        this.getStats(userId),
      ]);

      return {
        success: true,
        data: {
          userInfo,
          dailyStats,
          investmentStats,
          teamStats,
          recentTransactions,
          rewardProgress,
          monthlyStats,
          stats,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get basic user info with single query
   */
  async getUserBasicInfo(userId) {
    const query = `
        SELECT 
            u.id,
            u.username,
            u.full_name,
            u.email,
            u.phone,
            u.referral_code,
            u.referrer_id,
            u.status,
            u.created_at,
            u.last_login_at,
            COALESCE(uw.main_balance, 0) as main_balance,
            COALESCE(uw.roi_balance, 0) as roi_balance,
            COALESCE(uw.commission_balance, 0) as commission_balance,
            COALESCE(uw.bonus_balance, 0) as bonus_balance,
            COALESCE(uw.total_earned, 0) as total_earned,
            COALESCE(uw.total_withdrawn, 0) as total_withdrawn,
            COALESCE(uw.total_invested, 0) as total_invested,
            COALESCE(uw.locked_amount, 0) as locked_amount,
            (COALESCE(uw.main_balance, 0) + COALESCE(uw.roi_balance, 0) + 
             COALESCE(uw.commission_balance, 0) + COALESCE(uw.bonus_balance, 0)) as total_balance,
            referrer.referral_code as referred_by
        FROM users u
        LEFT JOIN user_wallets uw ON u.id = uw.user_id
        LEFT JOIN users referrer ON u.referrer_id = referrer.id
        WHERE u.id = ?
    `;

    const rows = await this.db.query(query, [userId]);
    return rows[0] || null;
  }

  /**
   * Get daily stats with fallback logic
   */
  async getDailyStats(userId, date) {
    // Try pre-computed daily summaries first
    let query = `
            SELECT 
                COALESCE(roi_earned, 0) as roi_earned,
                COALESCE(commission_earned, 0) as commission_earned,
                COALESCE(bonus_earned, 0) as bonus_earned,
                COALESCE(total_earned, 0) as total_earned,
                COALESCE(new_referrals, 0) as new_referrals,
                COALESCE(team_business, 0) as team_business,
                COALESCE(withdrawals_amount, 0) as withdrawals_amount,
                COALESCE(deposits_amount, 0) as deposits_amount,
                summary_date
            FROM daily_summaries
            WHERE user_id = ? AND summary_date = ?
        `;

    let rows = await this.db.query(query, [userId, date]);

    // If no pre-computed data, calculate from transactions
    if (rows.length === 0) {
      query = `
                SELECT 
                    COALESCE(SUM(CASE WHEN transaction_type = 'roi_earning' THEN net_amount ELSE 0 END), 0) as roi_earned,
                    COALESCE(SUM(CASE WHEN transaction_type = 'level_commission' THEN net_amount ELSE 0 END), 0) as commission_earned,
                    COALESCE(SUM(CASE WHEN transaction_type IN ('direct_bonus', 'reward_bonus') THEN net_amount ELSE 0 END), 0) as bonus_earned,
                    COALESCE(SUM(CASE WHEN transaction_type IN ('roi_earning', 'level_commission', 'direct_bonus', 'reward_bonus') THEN net_amount ELSE 0 END), 0) as total_earned,
                    0 as new_referrals,
                    0 as team_business,
                    COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END), 0) as withdrawals_amount,
                    COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN net_amount ELSE 0 END), 0) as deposits_amount,
                    ? as summary_date
                FROM transactions
                WHERE user_id = ? AND DATE(created_at) = ? AND status = 'completed'
            `;

      rows = await this.db.query(query, [date, userId, date]);

      // Get new referrals separately
      const referralRows = await this.db.query(
        "SELECT COUNT(*) as new_referrals FROM users WHERE referrer_id = ? AND DATE(created_at) = ?",
        [userId, date]
      );

      if (rows[0]) {
        rows[0].new_referrals = referralRows[0]?.new_referrals || 0;
      }
    }

    return (
      rows[0] || {
        roi_earned: 0,
        commission_earned: 0,
        bonus_earned: 0,
        total_earned: 0,
        new_referrals: 0,
        team_business: 0,
        withdrawals_amount: 0,
        deposits_amount: 0,
        summary_date: date,
      }
    );
  }

  /**
   * Get investment stats with better indexing hints
   */
  async getInvestmentStats(userId) {
    // Main investment stats
    const query = `
            SELECT 
                COUNT(ui.id) as total_investments,
                COUNT(CASE WHEN ui.status = 'active' THEN 1 END) as active_investments,
                COUNT(CASE WHEN ui.status = 'completed' THEN 1 END) as completed_investments,
                COALESCE(SUM(ui.invested_amount), 0) as total_invested,
                COALESCE(SUM(ui.total_earned), 0) as total_roi_earned,
                COALESCE(SUM(CASE WHEN ui.status = 'active' THEN ui.invested_amount ELSE 0 END), 0) as active_investment_amount,
                COALESCE(AVG(CASE WHEN ui.status = 'active' THEN 
                    DATEDIFF(ui.end_date, CURDATE()) ELSE 0 END), 0) as avg_days_remaining
            FROM user_investments ui
            WHERE ui.user_id = ?
        `;

    const rows = await this.db.query(query, [userId]);
    const stats = rows[0];

    // Get investment breakdown by plan (only if user has investments)
    let planRows = [];
    if (stats.total_investments > 0) {
      const planQuery = `
                SELECT 
                    ip.name as plan_name,
                    COUNT(ui.id) as investment_count,
                    SUM(ui.invested_amount) as total_amount,
                    SUM(ui.total_earned) as total_earned,
                    AVG(ip.daily_roi_percentage) as avg_roi_percentage
                FROM user_investments ui
                JOIN investment_plans ip ON ui.plan_id = ip.id
                WHERE ui.user_id = ? AND ui.status = 'active'
                GROUP BY ip.id, ip.name
            `;

      planRows = await this.db.query(planQuery, [userId]);
    }

    return {
      ...stats,
      investment_breakdown: planRows,
    };
  }

  /**
   * Get team stats with materialized view approach
   */
  async getTeamStats(userId) {
    // Get basic team stats
    const query = `
            SELECT 
                COALESCE(direct_referrals, 0) as direct_referrals,
                COALESCE(total_team_size, 0) as total_team_size,
                COALESCE(active_team_size, 0) as active_team_size,
                COALESCE(team_business, 0) as team_business
            FROM user_mlm_tree
            WHERE user_id = ? 
        `;

    const rows = await this.db.query(query, [userId]);
    const stats = rows[0] || {
      direct_referrals: 0,
      total_team_size: 0,
      active_team_size: 0,
      team_business: 0,
    };

    // Only get detailed breakdowns if user has a team
    let levelRows = [];
    let topPerformers = [];

    if (stats.total_team_size > 0) {
      // Get level-wise breakdown
      const levelQuery = `
                SELECT 
                    umt.level,
                    COUNT(DISTINCT umt.user_id) as members_count,
                    COALESCE(SUM(uw.total_invested), 0) as level_business
                FROM user_mlm_tree umt
                LEFT JOIN user_wallets uw ON umt.user_id = uw.user_id
                WHERE umt.path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
                AND umt.user_id != ?
                GROUP BY umt.level
                ORDER BY umt.level
                LIMIT 10
            `;

      levelRows = await this.db.query(levelQuery, [userId, userId]);

      // Get top performers
      const topPerformersQuery = `
                SELECT 
                    u.username,
                    u.full_name,
                    COALESCE(uw.total_invested, 0) as total_invested,
                    COALESCE(uw.total_earned, 0) as total_earned,
                    umt.level
                FROM user_mlm_tree umt
                JOIN users u ON umt.user_id = u.id
                LEFT JOIN user_wallets uw ON u.id = uw.user_id
                WHERE umt.path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
                AND umt.user_id != ?
                ORDER BY uw.total_invested DESC
                LIMIT 5
            `;

      topPerformers = await this.db.query(topPerformersQuery, [userId, userId]);
    }

    return {
      ...stats,
      level_breakdown: levelRows,
      top_performers: topPerformers,
    };
  }

  /**
   * Get recent transactions with better indexing
   */
  async getRecentTransactions(userId, limit = 10) {
    // Ensure limit is a positive integer
    const safeLimit = Math.max(1, Math.min(1000, parseInt(limit)));

    const query = `
        SELECT 
            t.id,
            t.transaction_type,
            t.amount,
            t.net_amount,
            t.status,
            t.created_at,
            t.reference_id,
            ru.username as related_user,
            ui.invested_amount as related_investment_amount
        FROM transactions t
        LEFT JOIN users ru ON t.related_user_id = ru.id
        LEFT JOIN user_investments ui ON t.related_investment_id = ui.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT ${safeLimit}
    `;

    const rows = await this.db.query(query, [userId]);
    return rows;
  }

  /**
   * Get reward progress
   */
  async getRewardProgress(userId) {
    const query = `
            SELECT 
                rp.title,
                rp.description,
                rp.reward_amount,
                ur.current_progress,
                ur.required_target,
                ur.achievement_percentage,
                ur.status,
                ur.achieved_at,
                ur.reward_amount as earned_reward
            FROM user_rewards ur
            JOIN reward_programs rp ON ur.reward_program_id = rp.id
            WHERE ur.user_id = ?
            ORDER BY ur.created_at DESC
            LIMIT 20
        `;

    const rows = await this.db.query(query, [userId]);
    return rows;
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(userId, date) {
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN transaction_type = 'roi_earning' THEN net_amount ELSE 0 END), 0) as monthly_roi,
                COALESCE(SUM(CASE WHEN transaction_type = 'level_commission' THEN net_amount ELSE 0 END), 0) as monthly_commission,
                COALESCE(SUM(CASE WHEN transaction_type = 'upline_commission' THEN net_amount ELSE 0 END), 0) as upline_commission,
                COALESCE(SUM(CASE WHEN transaction_type = 'direct_bonus' THEN net_amount ELSE 0 END), 0) as monthly_bonus,
                COALESCE(SUM(CASE WHEN transaction_type = 'reward_bonus' THEN net_amount ELSE 0 END), 0) as reward_bonus,
                COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN net_amount ELSE 0 END), 0) as monthly_deposits,
                COALESCE(SUM(CASE WHEN transaction_type = 'salary' THEN net_amount ELSE 0 END), 0) as salary,
                COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END), 0) as monthly_withdrawals,
                COUNT(CASE WHEN transaction_type = 'invest' THEN 1 END) as monthly_investments
            FROM transactions
            WHERE user_id = ? 
            AND DATE(created_at) BETWEEN ? AND ?
            AND status = 'completed'
        `;

    const rows = await this.db.query(query, [
      userId,
      startOfMonth.toISOString().split("T")[0],
      endOfMonth.toISOString().split("T")[0],
    ]);

    return (
      rows[0] || {
        monthly_roi: 0,
        monthly_commission: 0,
        upline_commission: 0,
        monthly_bonus: 0,
        reward_bonus: 0,
        monthly_deposits: 0,
        salary: 0,
        monthly_withdrawals: 0,
        monthly_investments: 0,
      }
    );
  }

  async getStats(userId) {
    const query = `
            SELECT 
                COALESCE(SUM(CASE WHEN transaction_type = 'roi_earning' THEN net_amount ELSE 0 END), 0) as total_roi,
                COALESCE(SUM(CASE WHEN transaction_type = 'level_commission' THEN net_amount ELSE 0 END), 0) as total_commission,
                COALESCE(SUM(CASE WHEN transaction_type = 'upline_commission' THEN net_amount ELSE 0 END), 0) as total_upline,
                COALESCE(SUM(CASE WHEN transaction_type = 'direct_bonus' THEN net_amount ELSE 0 END), 0) as total_direct,
                COALESCE(SUM(CASE WHEN transaction_type = 'reward_bonus' THEN net_amount ELSE 0 END), 0) as total_reward,
                COALESCE(SUM(CASE WHEN transaction_type = 'deposit' THEN net_amount ELSE 0 END), 0) as total_deposite,
                COALESCE(SUM(CASE WHEN transaction_type = 'salary' THEN net_amount ELSE 0 END), 0) as total_salary,
                COALESCE(SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END), 0) as total_withdrawals,
                COUNT(CASE WHEN transaction_type = 'invest' THEN 1 END) as total_investments
            FROM transactions
            WHERE user_id = ?
            AND status = 'completed'
        `;

    const rows = await this.db.query(query, [userId]);

    return (
      rows[0] || {
        total_roi: 0,
        total_commission: 0,
        total_upline: 0,
        total_direct: 0,
        total_reward: 0,
        total_deposite: 0,
        total_salary: 0,
        total_withdrawals: 0,
        total_investments: 0,
      }
    );
  }

  /**
   * Batch dashboard data for multiple users
   */
  async getMultiUserDashboard(userIds, date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Process in batches to avoid overwhelming the database
    const batchSize = 10;
    const results = {};

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map((userId) =>
        this.getUserDashboardStats(userId, targetDate)
      );

      const batchResults = await Promise.allSettled(promises);

      batch.forEach((userId, index) => {
        results[userId] =
          batchResults[index].status === "fulfilled"
            ? batchResults[index].value
            : {
                success: false,
                error: batchResults[index].reason?.message || "Unknown error",
              };
      });
    }

    return results;
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats(date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];

    const query = `
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT CASE WHEN u.status = 'active' THEN u.id END) as active_users,
                COUNT(DISTINCT CASE WHEN DATE(u.created_at) = ? THEN u.id END) as new_users_today,
                COALESCE(SUM(uw.total_invested), 0) as total_invested,
                COALESCE(SUM(uw.total_earned), 0) as total_earned,
                COALESCE(SUM(uw.total_withdrawn), 0) as total_withdrawn,
                COUNT(DISTINCT ui.id) as total_investments,
                COUNT(DISTINCT CASE WHEN ui.status = 'active' THEN ui.id END) as active_investments
            FROM users u
            LEFT JOIN user_wallets uw ON u.id = uw.user_id
            LEFT JOIN user_investments ui ON u.id = ui.user_id
        `;

    const rows = await this.db.query(query, [targetDate]);
    return rows[0];
  }

  /**
   * Execute database transaction
   */
  async executeTransaction(callback) {
    const connection = await this.db.pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Create a transaction-specific query method
      const transactionDb = {
        query: async (sql, params = []) => {
          const [results] = await connection.execute(sql, params);
          return results;
        }
      };
      
      const result = await callback(transactionDb);
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
   * Get database health check
   */
  async healthCheck() {
    try {
      const result = await this.db.query('SELECT 1 as healthy');
      return { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        result: result[0] 
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  /**
   * Get database pool statistics
   */
  getPoolStats() {
    const pool = this.db.pool;
    return {
      totalConnections: pool.pool._allConnections.length,
      freeConnections: pool.pool._freeConnections.length,
      acquiringConnections: pool.pool._acquiringConnections.length,
      connectionLimit: pool.config.connectionLimit,
      queueLimit: pool.config.queueLimit
    };
  }

  /**
   * Close database connections
   */
  async close() {
    try {
      await this.db.pool.end();
      console.log('Database pool closed successfully');
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }
}

module.exports = UserDashboard;