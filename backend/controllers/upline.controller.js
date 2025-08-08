// controllers/UplineRewardController.js
const UplineRewardService = require('../service/upline.service');
const User = require('../models/User');

class UplineRewardController {
  constructor() {
    this.uplineService = new UplineRewardService();
  }

  /**
   * Distribute upline rewards - Main endpoint
   * POST /api/upline-rewards/distribute
   */
  async distributeRewards(req, res) {
    try {
      const { userId, amount, sourceType, sourceDetails } = req.body;

      // Validation
      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'User ID and amount are required',
          data: null
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0',
          data: null
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      // Distribute upline rewards
      const result = await this.uplineService.distributeUplineRewards(
        userId,
        parseFloat(amount),
        sourceType || 'manual_upline_reward',
        sourceDetails || `Manual upline reward distribution for user ${userId}`
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: result.message,
          data: {
            totalDistributed: result.totalDistributed,
            rewardsDistributed: result.rewardsDistributed,
            processedLevels: result.processedLevels,
            errors: result.errors
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to distribute upline rewards',
          error: result.error,
          data: null
        });
      }

    } catch (error) {
      console.error('Error in distributeRewards:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        data: null
      });
    }
  }

  /**
   * Get upline chain for a user
   * GET /api/upline-rewards/chain/:userId
   */
  async getUplineChain(req, res) {
    try {
      const { userId } = req.params;
      const { levels } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
          data: null
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      const uplineChain = await this.uplineService.getUplineChain(
        parseInt(userId),
        parseInt(levels) || 3
      );

      return res.status(200).json({
        success: true,
        message: 'Upline chain retrieved successfully',
        data: {
          userId: parseInt(userId),
          uplineChain: uplineChain,
          totalLevels: uplineChain.length
        }
      });

    } catch (error) {
      console.error('Error in getUplineChain:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        data: null
      });
    }
  }

  /**
   * Validate user qualification for specific level
   * GET /api/upline-rewards/validate/:userId/:level
   */
  async validateUserLevel(req, res) {
    try {
      const { userId, level } = req.params;

      if (!userId || !level) {
        return res.status(400).json({
          success: false,
          message: 'User ID and level are required',
          data: null
        });
      }

      const levelNum = parseInt(level);
      if (levelNum < 1 || levelNum > 3) {
        return res.status(400).json({
          success: false,
          message: 'Level must be between 1 and 3',
          data: null
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      const validation = await this.uplineService.validateUserForLevel(
        parseInt(userId),
        levelNum
      );

      return res.status(200).json({
        success: true,
        message: 'User validation completed',
        data: validation
      });

    } catch (error) {
      console.error('Error in validateUserLevel:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        data: null
      });
    }
  }

  /**
   * Get direct children count for a user
   * GET /api/upline-rewards/children/:userId
   */
  async getDirectChildren(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
          data: null
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      const childrenCount = await this.uplineService.getDirectChildrenCount(parseInt(userId));

      return res.status(200).json({
        success: true,
        message: 'Direct children count retrieved successfully',
        data: {
          userId: parseInt(userId),
          directChildrenCount: childrenCount,
          qualifiesForRewards: childrenCount >= 15
        }
      });

    } catch (error) {
      console.error('Error in getDirectChildren:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        data: null
      });
    }
  }

  /**
   * Simulate upline reward distribution (without creating actual transactions)
   * POST /api/upline-rewards/simulate
   */
  async simulateRewards(req, res) {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'User ID and amount are required',
          data: null
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0',
          data: null
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      // Get upline chain and calculate potential rewards
      const uplineChain = await this.uplineService.getUplineChain(parseInt(userId), 3);
      const simulation = [];
      let totalPotentialRewards = 0;

      const rewardLevels = [
        { level: 1, percentage: 5, minChildren: 15 },
        { level: 2, percentage: 2, minChildren: 15 },
        { level: 3, percentage: 1, minChildren: 15 }
      ];

      uplineChain.forEach((uplineUser, index) => {
        const levelConfig = rewardLevels[index];
        if (!levelConfig) return;

        const wouldQualify = uplineUser.directChildren >= levelConfig.minChildren;
        const potentialReward = wouldQualify ? (parseFloat(amount) * levelConfig.percentage) / 100 : 0;

        if (wouldQualify) {
          totalPotentialRewards += potentialReward;
        }

        simulation.push({
          level: levelConfig.level,
          userId: uplineUser.userId,
          username: uplineUser.username,
          directChildren: uplineUser.directChildren,
          requiredChildren: levelConfig.minChildren,
          qualifies: wouldQualify,
          rewardPercentage: levelConfig.percentage,
          potentialReward: potentialReward,
          reason: wouldQualify 
            ? `Qualifies with ${uplineUser.directChildren} direct children`
            : `Needs ${levelConfig.minChildren - uplineUser.directChildren} more children`
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Upline reward simulation completed',
        data: {
          baseAmount: parseFloat(amount),
          totalPotentialRewards: totalPotentialRewards,
          simulation: simulation,
          qualifyingUsers: simulation.filter(s => s.qualifies).length
        }
      });

    } catch (error) {
      console.error('Error in simulateRewards:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
        data: null
      });
    }
  }
}

module.exports = UplineRewardController;