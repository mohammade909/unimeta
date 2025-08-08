const database = require('../database'); // Your existing database.js file

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
   * Get user statistics - Optimized with single complex query
   */
  async getUserStats() {
    try {
      const query = `
        SELECT 
          -- Basic counts
          COUNT(*) as total_users,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
          SUM(CASE WHEN status = 'banned' THEN 1 ELSE 0 END) as banned_users,
          
          -- Registration stats
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_registrations,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_registrations,
          SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month_registrations,
          
          -- Verification stats
          SUM(CASE WHEN email_verified_at IS NOT NULL THEN 1 ELSE 0 END) as email_verified,
          SUM(CASE WHEN phone_verified_at IS NOT NULL THEN 1 ELSE 0 END) as phone_verified,
          SUM(CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END) as email_unverified,
          SUM(CASE WHEN phone_verified_at IS NULL THEN 1 ELSE 0 END) as phone_unverified
        FROM users
      `;

      const [basicStats] = await this.db.query(query);

      // Get role distribution separately for cleaner data
      const roleQuery = `
        SELECT 
          COALESCE(role, 'unknown') as role,
          COUNT(*) as count
        FROM users 
        GROUP BY role
        ORDER BY count DESC
      `;

      const roleStats = await this.db.query(roleQuery);

      // Get monthly growth
      const monthlyQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as registrations
        FROM users 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `;

      const monthlyGrowth = await this.db.query(monthlyQuery);

      return {
        basic: basicStats || {},
        verification: {
          email_verified: basicStats?.email_verified || 0,
          phone_verified: basicStats?.phone_verified || 0,
          email_unverified: basicStats?.email_unverified || 0,
          phone_unverified: basicStats?.phone_unverified || 0
        },
        roles: roleStats || [],
        monthlyGrowth: monthlyGrowth || []
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        basic: {},
        verification: {},
        roles: [],
        monthlyGrowth: []
      };
    }
  }

  /**
   * Get transaction statistics - Optimized
   */
  async getTransactionStats() {
    try {
      const basicQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(amount), 0) as total_volume,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as completed_volume,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_volume,
          COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_volume,
          COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN amount ELSE 0 END), 0) as today_volume,
          COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN amount ELSE 0 END), 0) as week_volume,
          COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN amount ELSE 0 END), 0) as month_volume
        FROM transactions
      `;

      const [basicStats] = await this.db.query(basicQuery);

      // Get transaction type breakdown
      const typeQuery = `
        SELECT 
          COALESCE(transaction_type, 'unknown') as transaction_type,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as avg_amount
        FROM transactions 
        WHERE status = 'completed'
        GROUP BY transaction_type
        ORDER BY total_amount DESC
      `;

      const typeBreakdown = await this.db.query(typeQuery);

      // Get daily volume for chart
      const dailyQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          COALESCE(SUM(amount), 0) as daily_volume
        FROM transactions 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      const dailyVolume = await this.db.query(dailyQuery);

      return {
        basic: basicStats || {},
        byType: typeBreakdown || [],
        dailyVolume: dailyVolume || [],
        byStatus: [] // Can be derived from basic stats if needed
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return {
        basic: {},
        byType: [],
        dailyVolume: [],
        byStatus: []
      };
    }
  }

  /**
   * Get investment statistics - Optimized
   */
  async getInvestmentStats() {
    try {
      const basicQuery = `
        SELECT 
          COUNT(*) as total_investments,
          COALESCE(SUM(invested_amount), 0) as total_invested,
          COALESCE(SUM(CASE WHEN total_earned IS NOT NULL THEN total_earned ELSE 0 END), 0) as total_earned,
          COALESCE(SUM(CASE WHEN current_value IS NOT NULL THEN current_value ELSE invested_amount END), 0) as current_value,
          COALESCE(SUM(CASE WHEN status = 'active' THEN invested_amount ELSE 0 END), 0) as active_investments,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN invested_amount ELSE 0 END), 0) as completed_investments,
          COALESCE(AVG(invested_amount), 0) as avg_investment_amount,
          COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN invested_amount ELSE 0 END), 0) as today_investments,
          COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN invested_amount ELSE 0 END), 0) as week_investments,
          COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN invested_amount ELSE 0 END), 0) as month_investments
        FROM user_investments
      `;

      const [basicStats] = await this.db.query(basicQuery);

      // Get investment by plan (with LEFT JOIN for safety)
      const planQuery = `
        SELECT 
          COALESCE(ip.name, 'Unknown Plan') as plan_name,
          COUNT(ui.id) as investment_count,
          COALESCE(SUM(ui.invested_amount), 0) as total_invested,
          COALESCE(SUM(ui.total_earned), 0) as total_earned,
          COALESCE(AVG(ui.invested_amount), 0) as avg_amount
        FROM user_investments ui
        LEFT JOIN investment_plans ip ON ui.plan_id = ip.id
        GROUP BY ui.plan_id, ip.name
        ORDER BY total_invested DESC
        LIMIT 10
      `;

      const planStats = await this.db.query(planQuery);

      return {
        basic: basicStats || {},
        byPlan: planStats || [],
        byStatus: [], // Can add if needed
        monthlyTrend: [] // Can add if needed
      };
    } catch (error) {
      console.error('Error fetching investment stats:', error);
      return {
        basic: {},
        byPlan: [],
        byStatus: [],
        monthlyTrend: []
      };
    }
  }

  /**
   * Get withdrawal statistics - Optimized
   */
  async getWithdrawalStats() {
    try {
      const basicQuery = `
        SELECT 
          COUNT(*) as total_requests,
          COALESCE(SUM(requested_amount), 0) as total_requested,
          COALESCE(SUM(CASE WHEN net_amount IS NOT NULL THEN net_amount ELSE requested_amount END), 0) as total_net_amount,
          COALESCE(SUM(CASE WHEN fee_amount IS NOT NULL THEN fee_amount ELSE 0 END), 0) as total_fees,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN COALESCE(net_amount, requested_amount) ELSE 0 END), 0) as completed_amount,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN COALESCE(net_amount, requested_amount) ELSE 0 END), 0) as pending_amount,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN COALESCE(net_amount, requested_amount) ELSE 0 END), 0) as rejected_amount,
          COALESCE(AVG(requested_amount), 0) as avg_withdrawal_amount,
          COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() THEN requested_amount ELSE 0 END), 0) as today_requests,
          COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN requested_amount ELSE 0 END), 0) as week_requests
        FROM withdrawal_requests
      `;

      const [basicStats] = await this.db.query(basicQuery);

      // Get pending requests for admin attention
      const pendingQuery = `
        SELECT 
          wr.id,
          u.username,
          wr.requested_amount,
          COALESCE(wr.withdrawal_method, 'not_specified') as withdrawal_method,
          wr.created_at
        FROM withdrawal_requests wr
        LEFT JOIN users u ON wr.user_id = u.id
        WHERE wr.status = 'pending'
        ORDER BY wr.created_at ASC
        LIMIT 10
      `;

      const pendingRequests = await this.db.query(pendingQuery);

      return {
        basic: basicStats || {},
        byMethod: [], // Can add if needed
        byStatus: [], // Can add if needed
        pendingRequests: pendingRequests || []
      };
    } catch (error) {
      console.error('Error fetching withdrawal stats:', error);
      return {
        basic: {},
        byMethod: [],
        byStatus: [],
        pendingRequests: []
      };
    }
  }

  /**
   * Get recent activity - Simplified and optimized
   */
  async getRecentActivity(limit = 20) {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

      // Simplified approach - get recent activities from different tables
      const queries = [
        // Recent registrations
        `SELECT 
          'registration' as activity_type,
          u.username,
          u.full_name,
          NULL as amount,
          u.created_at as activity_time
        FROM users u
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY u.created_at DESC
        LIMIT 5`,

        // Recent transactions
        `SELECT 
          CONCAT('transaction_', COALESCE(transaction_type, 'unknown')) as activity_type,
          u.username,
          u.full_name,
          t.amount,
          t.created_at as activity_time
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND t.status = 'completed'
        ORDER BY t.created_at DESC
        LIMIT 10`,

        // Recent withdrawals
        `SELECT 
          'withdrawal' as activity_type,
          u.username,
          u.full_name,
          wr.requested_amount as amount,
          wr.created_at as activity_time
        FROM withdrawal_requests wr
        LEFT JOIN users u ON wr.user_id = u.id
        WHERE wr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY wr.created_at DESC
        LIMIT 5`
      ];

      const [registrations, transactions, withdrawals] = await Promise.all(
        queries.map(query => this.db.query(query))
      );

      // Combine and sort all activities
      const allActivities = [
        ...(registrations || []),
        ...(transactions || []),
        ...(withdrawals || [])
      ].sort((a, b) => new Date(b.activity_time) - new Date(a.activity_time))
       .slice(0, safeLimit);

      return allActivities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get top performers - Simplified
   */
  async getTopPerformers(limit = 10) {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

      const query = `
        SELECT 
          u.id,
          u.username,
          u.full_name,
          COALESCE(uw.total_earned, 0) as total_earned,
          COALESCE(uw.total_invested, 0) as total_invested,
          COALESCE(uw.total_withdrawn, 0) as total_withdrawn,
          COALESCE(uw.main_balance, 0) as main_balance
        FROM users u
        LEFT JOIN user_wallets uw ON u.id = uw.user_id
        WHERE u.status = 'active' 
          AND COALESCE(uw.total_earned, 0) > 0
        ORDER BY uw.total_earned DESC
        LIMIT ?
      `;

      return await this.db.query(query, [safeLimit]);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      return [];
    }
  }

  /**
   * Get financial overview - Simplified
   */
  async getFinancialOverview() {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(main_balance), 0) as total_main_balance,
          COALESCE(SUM(roi_balance), 0) as total_roi_balance,
          COALESCE(SUM(commission_balance), 0) as total_commission_balance,
          COALESCE(SUM(bonus_balance), 0) as total_bonus_balance,
          COALESCE(SUM(total_earned), 0) as total_system_earnings,
          COALESCE(SUM(total_withdrawn), 0) as total_system_withdrawals,
          COALESCE(SUM(total_invested), 0) as total_system_investments
        FROM user_wallets
      `;

      const [financialData] = await this.db.query(query);

      return {
        systemBalances: financialData || {},
        monthlyFinancials: [], // Can be added later if needed
        feeCollection: {}
      };
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      return {
        systemBalances: {},
        monthlyFinancials: [],
        feeCollection: {}
      };
    }
  }

  /**
   * Get system health - Quick check
   */
  async getSystemHealth() {
    try {
      const queries = [
        'SELECT COUNT(*) as user_count FROM users',
        'SELECT COUNT(*) as transaction_count FROM transactions WHERE DATE(created_at) = CURDATE()',
        'SELECT COUNT(*) as pending_withdrawals FROM withdrawal_requests WHERE status = "pending"'
      ];

      const [userCount, todayTransactions, pendingWithdrawals] = await Promise.all(
        queries.map(query => this.db.query(query))
      );

      return {
        users: userCount[0]?.user_count || 0,
        todayTransactions: todayTransactions[0]?.transaction_count || 0,
        pendingWithdrawals: pendingWithdrawals[0]?.pending_withdrawals || 0,
        status: 'healthy'
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        users: 0,
        todayTransactions: 0,
        pendingWithdrawals: 0,
        status: 'error'
      };
    }
  }

  /**
   * Get comprehensive admin report - Optimized
   */
  async getComprehensiveReport() {
    try {
      const [
        dashboardStats,
        topPerformers,
        financialOverview,
        systemHealth
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getTopPerformers(15),
        this.getFinancialOverview(),
        this.getSystemHealth()
      ]);

      return {
        success: true,
        data: {
          dashboard: dashboardStats.data,
          topPerformers,
          financial: financialOverview,
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
}

module.exports = AdminStatsService;