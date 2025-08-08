// controllers/CommissionController.js
const CommissionService = require('../services/CommissionService');
const CronService = require('../services/CronService');

class CommissionController {
  constructor() {
    this.commissionService = new CommissionService();
    this.cronService = new CronService();
  }

  /**
   * Process commission for all users (Admin only)
   */
  async processAllCommissions(req, res) {
    try {
      // Check if user has admin privileges
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const result = await this.commissionService.calculateCommissionForAllUsers();
      
      return res.json({
        success: true,
        data: result,
        message: result.success ? 'Commission processing completed' : 'Commission processing was skipped'
      });
    } catch (error) {
      console.error('Error processing all commissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Process commission for a specific user (Admin only)
   */
  async processUserCommission(req, res) {
    try {
      // Check if user has admin privileges
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await this.cronService.processUserCommission(parseInt(userId));
      
      return res.json({
        success: true,
        data: result,
        message: 'User commission processing completed'
      });
    } catch (error) {
      console.error('Error processing user commission:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get commission settings
   */
  async getCommissionSettings(req, res) {
    try {
      // Check if user has admin privileges
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const settings = await this.cronService.getCommissionSettings();
      
      return res.json({
        success: true,
        data: settings,
        message: 'Commission settings retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting commission settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get user level information
   */
  async getUserLevelInfo(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Users can only view their own level info unless they're admin
      if (req.user.role !== 'admin' && parseInt(userId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own level information.'
        });
      }

      const levelInfo = await this.cronService.getUserLevelInfo(parseInt(userId));
      
      return res.json({
        success: true,
        data: levelInfo,
        message: 'User level information retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting user level info:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get user's referral tree
   */
  async getUserReferralTree(req, res) {
    try {
      const { referralCode } = req.params;
      const { depth = 5 } = req.query;
      
      if (!referralCode) {
        return res.status(400).json({
          success: false,
          message: 'Referral code is required'
        });
      }

      // Users can only view their own referral tree unless they're admin
      if (req.user.role !== 'admin' && req.user.referral_code !== referralCode) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own referral tree.'
        });
      }

      const tree = await this.cronService.getUserReferralTree(referralCode, parseInt(depth));
      
      return res.json({
        success: true,
        data: tree,
        message: 'Referral tree retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting referral tree:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get user's full referral tree
   */
  async getUserFullReferralTree(req, res) {
    try {
      const { referralCode } = req.params;
      
      if (!referralCode) {
        return res.status(400).json({
          success: false,
          message: 'Referral code is required'
        });
      }

      // Users can only view their own referral tree unless they're admin
      if (req.user.role !== 'admin' && req.user.referral_code !== referralCode) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own referral tree.'
        });
      }

      const tree = await this.cronService.getUserFullReferralTree(referralCode);
      
      return res.json({
        success: true,
        data: tree,
        message: 'Full referral tree retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting full referral tree:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get user's commission history
   */
  async getUserCommissionHistory(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Users can only view their own commission history unless they're admin
      if (req.user.role !== 'admin' && parseInt(userId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own commission history.'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const sql = `
        SELECT 
          id, 
          amount, 
          source_details, 
          status, 
          created_at,
          processed_at
        FROM transactions 
        WHERE user_id = ? 
        AND transaction_type = 'level_commission'
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const Database = require('../database');
      const [rows] = await Database.query(sql, [parseInt(userId), parseInt(limit), offset]);

      // Parse source_details for better readability
      const commissions = rows.map(row => ({
        ...row,
        source_details: JSON.parse(row.source_details)
      }));

      return res.json({
        success: true,
        data: {
          commissions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: commissions.length
          }
        },
        message: 'Commission history retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting commission history:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = CommissionController;