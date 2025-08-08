const database = require('../database'); // Assuming your database file is named database.js

class AdminStatsService {
  constructor() {
    this.db = database;
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [
        userStats,
        transactionStats,
        investmentStats,
        withdrawalStats,
        recentActivity
      ] = await Promise.all([
        this.getUserStats(),
        this.getTransactionStats(),
        this.getInvestmentStats(),
        this.getWithdrawalStats(),
        this.getRecentActivity()
      ]);

      return {
        success: true,
        data: {
          users: userStats,
          transactions: transactionStats,
          investments: investmentStats,
          withdrawals: withdrawalStats,
          recentActivity
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.message
      };
    }

  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const queries = [
      // Total users and growth
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
        SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_registrations,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_registrations,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month_registrations
      FROM users`,

      // Email and phone verification stats
      `SELECT 
        SUM(CASE WHEN email_verified_at IS NOT NULL THEN 1 ELSE 0 END) as email_verified,
        SUM(CASE WHEN phone_verified_at IS NOT NULL THEN 1 ELSE 0 END) as phone_verified,
        SUM(CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END) as email_unverified,
        SUM(CASE WHEN phone_verified_at IS NULL THEN 1 ELSE 0 END) as phone_unverified
      FROM users`,

      // Role distribution
      `SELECT 
        role,
        COUNT(*) as count
      FROM users 
      GROUP BY role`,

      // Monthly user growth
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as registrations
      FROM users 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`
    ];

    const [basicStats, verificationStats, roleStats, monthlyGrowth] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      basic: basicStats[0],
      verification: verificationStats[0],
      roles: roleStats,
      monthlyGrowth: monthlyGrowth.reverse() // Reverse to get chronological order
    };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats() {
    const queries = [
      // Overall transaction stats
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_volume,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_volume,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_volume,
        SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as failed_volume,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN amount ELSE 0 END) as today_volume,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN amount ELSE 0 END) as week_volume,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as month_volume
      FROM transactions`,

      // Transaction type breakdown
      `SELECT 
        transaction_type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE status = 'completed'
      GROUP BY transaction_type
      ORDER BY total_amount DESC`,

      // Daily transaction volume (last 30 days)
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(amount) as daily_volume
      FROM transactions 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC`,

      // Status distribution
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions 
      GROUP BY status`
    ];

    const [basicStats, typeBreakdown, dailyVolume, statusStats] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      basic: basicStats[0],
      byType: typeBreakdown,
      dailyVolume: dailyVolume.reverse(),
      byStatus: statusStats
    };
  }

  /**
   * Get investment statistics
   */
  async getInvestmentStats() {
    const queries = [
      // Overall investment stats
      `SELECT 
        COUNT(*) as total_investments,
        SUM(invested_amount) as total_invested,
        SUM(total_earned) as total_earned,
        SUM(current_value) as current_value,
        SUM(CASE WHEN status = 'active' THEN invested_amount ELSE 0 END) as active_investments,
        SUM(CASE WHEN status = 'completed' THEN invested_amount ELSE 0 END) as completed_investments,
        AVG(invested_amount) as avg_investment_amount,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN invested_amount ELSE 0 END) as today_investments,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN invested_amount ELSE 0 END) as week_investments,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN invested_amount ELSE 0 END) as month_investments
      FROM user_investments`,

      // Investment by plan
      `SELECT 
        ip.name as plan_name,
        COUNT(ui.id) as investment_count,
        SUM(ui.invested_amount) as total_invested,
        SUM(ui.total_earned) as total_earned,
        AVG(ui.invested_amount) as avg_amount
      FROM user_investments ui
      JOIN investment_plans ip ON ui.plan_id = ip.id
      GROUP BY ip.id, ip.name
      ORDER BY total_invested DESC`,

      // Investment status breakdown
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(invested_amount) as total_amount
      FROM user_investments 
      GROUP BY status`,

      // Monthly investment trend
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as investment_count,
        SUM(invested_amount) as total_amount
      FROM user_investments 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`
    ];

    const [basicStats, planStats, statusStats, monthlyTrend] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      basic: basicStats[0],
      byPlan: planStats,
      byStatus: statusStats,
      monthlyTrend: monthlyTrend.reverse()
    };
  }

  /**
   * Get withdrawal statistics
   */
  async getWithdrawalStats() {
    const queries = [
      // Overall withdrawal stats
      `SELECT 
        COUNT(*) as total_requests,
        SUM(requested_amount) as total_requested,
        SUM(net_amount) as total_net_amount,
        SUM(fee_amount) as total_fees,
        SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status = 'rejected' THEN net_amount ELSE 0 END) as rejected_amount,
        AVG(requested_amount) as avg_withdrawal_amount,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN requested_amount ELSE 0 END) as today_requests,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN requested_amount ELSE 0 END) as week_requests
      FROM withdrawal_requests`,

      // Withdrawal by method
      `SELECT 
        withdrawal_method,
        COUNT(*) as count,
        SUM(requested_amount) as total_amount,
        AVG(requested_amount) as avg_amount
      FROM withdrawal_requests 
      GROUP BY withdrawal_method`,

      // Status breakdown
      `SELECT 
        status,
        COUNT(*) as count,
        SUM(requested_amount) as total_amount
      FROM withdrawal_requests 
      GROUP BY status`,

      // Pending withdrawals requiring attention
      `SELECT 
        wr.id,
        u.username,
        wr.requested_amount,
        wr.withdrawal_method,
        wr.created_at
      FROM withdrawal_requests wr
      JOIN users u ON wr.user_id = u.id
      WHERE wr.status = 'pending'
      ORDER BY wr.created_at ASC
      LIMIT 10`
    ];

    const [basicStats, methodStats, statusStats, pendingRequests] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      basic: basicStats[0],
      byMethod: methodStats,
      byStatus: statusStats,
      pendingRequests
    };
  }

  /**
   * Get top achievers and rewards
   */
  async getTopAchievers(limit = 10) {
    const queries = [
      // Top earners (by total earnings)
      `SELECT 
        u.id,
        u.username,
        u.full_name,
        u.profile_image,
        uw.total_earned,
        uw.total_invested,
        umt.direct_referrals,
        umt.total_team_size
      FROM users u
      JOIN user_wallets uw ON u.id = uw.user_id
      LEFT JOIN user_mlm_tree umt ON u.id = umt.user_id AND umt.parent_id IS NULL
      WHERE u.status = 'active' AND uw.total_earned > 0
      ORDER BY uw.total_earned DESC
      LIMIT ?`,

      // Top recruiters (by direct referrals)
      `SELECT 
        u.id,
        u.username,
        u.full_name,
        u.profile_image,
        umt.direct_referrals,
        umt.total_team_size,
        umt.team_business,
        uw.total_earned
      FROM users u
      JOIN user_mlm_tree umt ON u.id = umt.user_id AND umt.parent_id IS NULL
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      WHERE u.status = 'active' AND umt.direct_referrals > 0
      ORDER BY umt.direct_referrals DESC
      LIMIT ?`,

      // Top investors (by total invested)
      `SELECT 
        u.id,
        u.username,
        u.full_name,
        u.profile_image,
        uw.total_invested,
        uw.total_earned,
        COUNT(ui.id) as active_investments,
        SUM(ui.invested_amount) as current_investments
      FROM users u
      JOIN user_wallets uw ON u.id = uw.user_id
      LEFT JOIN user_investments ui ON u.id = ui.user_id AND ui.status = 'active'
      WHERE u.status = 'active' AND uw.total_invested > 0
      GROUP BY u.id
      ORDER BY uw.total_invested DESC
      LIMIT ?`,

      // Recent achievers from top_achievers table
      `SELECT 
        ta.id,
        u.username,
        u.full_name,
        u.profile_image,
        ta.achievement_type,
        ta.title,
        ta.description,
        ta.achievement_value,
        ta.achievement_date
      FROM top_achievers ta
      JOIN users u ON ta.user_id = u.id
      WHERE ta.is_active = 1
      ORDER BY ta.achievement_date DESC, ta.display_order ASC
      LIMIT ?`,

      // Reward achievements summary
      `SELECT 
        rp.title as reward_title,
        rp.reward_type,
        COUNT(ur.id) as total_achievers,
        SUM(CASE WHEN ur.status = 'claimed' THEN ur.reward_amount ELSE 0 END) as total_claimed,
        SUM(CASE WHEN ur.status = 'achieved' THEN ur.reward_amount ELSE 0 END) as total_unclaimed
      FROM reward_programs rp
      LEFT JOIN user_rewards ur ON rp.id = ur.reward_program_id
      WHERE rp.is_active = 1
      GROUP BY rp.id
      ORDER BY total_claimed DESC`
    ];

    const [topEarners, topRecruiters, topInvestors, recentAchievers, rewardSummary] = await Promise.all(
      queries.map(query => this.db.query(query, [limit]))
    );

    return {
      topEarners,
      topRecruiters,
      topInvestors,
      recentAchievers,
      rewardSummary
    };
  }

  /**
   * Get recent activity for dashboard
   */
async getRecentActivity(limit = 20) {
  // Ensure limit is a safe integer to prevent SQL injection
  const safeLimit = parseInt(limit, 10);
  if (isNaN(safeLimit) || safeLimit < 1 || safeLimit > 1000) {
    throw new Error('Invalid limit parameter');
  }

  const query = `
    SELECT 
      'user_registration' as activity_type,
      u.username,
      u.full_name,
      NULL as amount,
      u.created_at as activity_time
    FROM users u
    WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    
    UNION ALL
    
    SELECT 
      'investment' as activity_type,
      u.username,
      u.full_name,
      ui.invested_amount as amount,
      ui.created_at as activity_time
    FROM user_investments ui
    JOIN users u ON ui.user_id = u.id
    WHERE ui.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    
    UNION ALL
    
    SELECT 
      'withdrawal' as activity_type,
      u.username,
      u.full_name,
      wr.requested_amount as amount,
      wr.created_at as activity_time
    FROM withdrawal_requests wr
    JOIN users u ON wr.user_id = u.id
    WHERE wr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    
    UNION ALL
    
    SELECT 
      'deposit' as activity_type,
      u.username,
      u.full_name,
      dr.amount as amount,
      dr.created_at as activity_time
    FROM deposit_requests dr
    JOIN users u ON dr.user_id = u.id
    WHERE dr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    
    ORDER BY activity_time DESC
    LIMIT ${safeLimit}
  `;

  // Call without parameters array since we're using string interpolation
  return await this.db.query(query);
}
  /**
   * Get financial overview
   */
  async getFinancialOverview() {
    const queries = [
      // Total system balances
      `SELECT 
        SUM(main_balance) as total_main_balance,
        SUM(roi_balance) as total_roi_balance,
        SUM(commission_balance) as total_commission_balance,
        SUM(bonus_balance) as total_bonus_balance,
        SUM(total_earned) as total_system_earnings,
        SUM(total_withdrawn) as total_system_withdrawals,
        SUM(total_invested) as total_system_investments
      FROM user_wallets`,

      // Monthly financial summary
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(CASE WHEN transaction_type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN transaction_type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as withdrawals,
        SUM(CASE WHEN transaction_type = 'roi_earning' AND status = 'completed' THEN amount ELSE 0 END) as roi_paid,
        SUM(CASE WHEN transaction_type = 'level_commission' AND status = 'completed' THEN amount ELSE 0 END) as commissions_paid
      FROM transactions 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12`,

      // Fee collection summary
      `SELECT 
        SUM(fee_amount) as total_fees_collected,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN fee_amount ELSE 0 END) as monthly_fees,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN fee_amount ELSE 0 END) as weekly_fees
      FROM transactions 
      WHERE status = 'completed' AND fee_amount > 0`
    ];

    const [systemBalances, monthlyFinancials, feeCollection] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      systemBalances: systemBalances[0],
      monthlyFinancials: monthlyFinancials.reverse(),
      feeCollection: feeCollection[0]
    };
  }

  /**
   * Get MLM network statistics
   */
  async getMLMNetworkStats() {
    const queries = [
      // Level-wise distribution
      `SELECT 
        level,
        COUNT(*) as user_count,
        SUM(direct_referrals) as total_referrals,
        SUM(team_business) as total_business,
        AVG(team_business) as avg_business
      FROM user_mlm_tree
      WHERE parent_id IS NOT NULL
      GROUP BY level
      ORDER BY level`,

      // Top performers by level
      `SELECT 
        umt.level,
        u.username,
        u.full_name,
        umt.direct_referrals,
        umt.total_team_size,
        umt.team_business
      FROM user_mlm_tree umt
      JOIN users u ON umt.user_id = u.id
      WHERE umt.parent_id IS NOT NULL
      ORDER BY umt.level, umt.team_business DESC`,

      // Commission distribution
      `SELECT 
        mlc.level_number,
        mlc.commission_percentage,
        COUNT(t.id) as total_commissions,
        SUM(t.amount) as total_amount
      FROM mlm_level_config mlc
      LEFT JOIN transactions t ON t.transaction_type = 'level_commission' 
        AND JSON_EXTRACT(t.source_details, '$.level') = mlc.level_number
      WHERE mlc.is_active = 1
      GROUP BY mlc.level_number
      ORDER BY mlc.level_number`
    ];

    const [levelDistribution, topPerformers, commissionStats] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      levelDistribution,
      topPerformers,
      commissionStats
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealth() {
    const queries = [
      // Database health
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_records
      FROM transactions`,

      // User activity
      `SELECT 
        COUNT(DISTINCT user_id) as active_users_today,
        COUNT(DISTINCT CASE WHEN DATE(last_login_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN id END) as active_users_week
      FROM users`,

      // Pending operations
      `SELECT 
        'withdrawal_requests' as operation_type,
        COUNT(*) as pending_count
      FROM withdrawal_requests 
      WHERE status = 'pending'
      
      UNION ALL
      
      SELECT 
        'deposit_requests' as operation_type,
        COUNT(*) as pending_count
      FROM deposit_requests 
      WHERE status = 'pending'
      
      UNION ALL
      
      SELECT 
        'transactions' as operation_type,
        COUNT(*) as pending_count
      FROM transactions 
      WHERE status = 'pending'`
    ];

    const [dbHealth, userActivity, pendingOps] = await Promise.all(
      queries.map(query => this.db.query(query))
    );

    return {
      database: dbHealth[0],
      userActivity: userActivity[0],
      pendingOperations: pendingOps
    };
  }

  /**
   * Get comprehensive admin report
   */
  async getComprehensiveReport() {
    try {
      const [
        dashboardStats,
        topAchievers,
        financialOverview,
        mlmStats,
        systemHealth
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getTopAchievers(15),
        this.getFinancialOverview(),
        this.getMLMNetworkStats(),
        this.getSystemHealth()
      ]);

      return {
        success: true,
        data: {
          dashboard: dashboardStats.data,
          topAchievers,
          financial: financialOverview,
          mlmNetwork: mlmStats,
          systemHealth,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user performance metrics
   */
  async getUserPerformanceMetrics(userId = null, limit = 50) {
    let userFilter = '';
    let params = [limit];
    
    if (userId) {
      userFilter = 'WHERE u.id = ?';
      params = [userId, limit];
    }

    const query = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.created_at as join_date,
        u.status,
        
        -- Financial metrics
        uw.total_earned,
        uw.total_invested,
        uw.total_withdrawn,
        uw.main_balance,
        uw.roi_balance,
        uw.commission_balance,
        
        -- MLM metrics
        umt.direct_referrals,
        umt.total_team_size,
        umt.team_business,
        
        -- Investment metrics
        COUNT(ui.id) as active_investments,
        SUM(ui.invested_amount) as current_investment_amount,
        
        -- Recent activity
        MAX(u.last_login_at) as last_login,
        
        -- Performance score (calculated)
        (
          (uw.total_earned * 0.3) + 
          (umt.direct_referrals * 100 * 0.3) + 
          (umt.team_business * 0.2) + 
          (uw.total_invested * 0.2)
        ) as performance_score
        
      FROM users u
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      LEFT JOIN user_mlm_tree umt ON u.id = umt.user_id AND umt.parent_id IS NULL
      LEFT JOIN user_investments ui ON u.id = ui.user_id AND ui.status = 'active'
      ${userFilter}
      GROUP BY u.id
      ORDER BY performance_score DESC
      LIMIT ?
    `;

    return await this.db.query(query, params);
  }
}

module.exports = AdminStatsService;