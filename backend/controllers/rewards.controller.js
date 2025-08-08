const Rewards = require('../models/Rewards'); // Adjust path as needed

class RewardController {
  // Get all reward programs with optional filters and pagination
  static async getAllRewards(req, res) {
    try {
      const {
        reward_type,
        is_active,
        start_date,
        end_date,
        page = 1,
        limit = 10,
        active_only = false
      } = req.query;

      // Build filters object
      const filters = {};
      if (reward_type) filters.reward_type = reward_type;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;

      // Add pagination
      const offset = (page - 1) * limit;
      filters.limit = parseInt(limit);
      filters.offset = parseInt(offset);

      let rewardss;
      let total;

      if (active_only === 'true') {
        rewardss = await Rewards.findActive();
        total = rewardss.length;
      } else {
        rewardss = await Rewards.findAll(filters);
        total = await Rewards.count(filters);
      }

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: rewardss.map(program => program.toJSON()),
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        },
        message: 'Reward programs retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAllRewardss:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get reward program by ID
  static async getRewardById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward program ID'
        });
      }

      const rewards = await Rewards.findById(id);

      if (!rewards) {
        return res.status(404).json({
          success: false,
          message: 'Reward program not found'
        });
      }

      res.status(200).json({
        success: true,
        data: rewards.toJSON(),
        message: 'Reward program retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getRewardsById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create new reward program
  static async createReward(req, res) {
    try {
      const rewardsData = req.body;

      // Create new reward program instance
      const rewards = new Rewards(rewardsData);

      // Save to database
      await rewards.save();

      res.status(201).json({
        success: true,
        data: rewards.toJSON(),
        message: 'Reward program created successfully'
      });
    } catch (error) {
      console.error('Error in createRewards:', error);
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update reward program
  static async updateReward(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward program ID'
        });
      }

      // Find existing reward program
      const existingRewards = await Rewards.findById(id);
      if (!existingRewards) {
        return res.status(404).json({
          success: false,
          message: 'Reward program not found'
        });
      }

      // Update properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          existingRewards[key] = updateData[key];
        }
      });

      // Save changes
      await existingRewards.update();

      res.status(200).json({
        success: true,
        data: existingRewards.toJSON(),
        message: 'Reward program updated successfully'
      });
    } catch (error) {
      console.error('Error in updateRewards:', error);
      
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete reward program
  static async deleteReward(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward program ID'
        });
      }

      const rewards = await Rewards.findById(id);
      if (!rewards) {
        return res.status(404).json({
          success: false,
          message: 'Reward program not found'
        });
      }

      await rewards.delete();

      res.status(200).json({
        success: true,
        message: 'Reward program deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteRewards:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Deactivate reward program (soft delete)
  static async deactivateReward(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward program ID'
        });
      }

      const rewards = await Rewards.findById(id);
      if (!rewards) {
        return res.status(404).json({
          success: false,
          message: 'Reward program not found'
        });
      }

      await rewards.deactivate();

      res.status(200).json({
        success: true,
        data: rewards.toJSON(),
        message: 'Reward program deactivated successfully'
      });
    } catch (error) {
      console.error('Error in deactivateRewards:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Activate reward program
  static async activateReward(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward program ID'
        });
      }

      const rewards = await Rewards.findById(id);
      if (!rewards) {
        return res.status(404).json({
          success: false,
          message: 'Reward program not found'
        });
      }

      await rewards.activate();

      res.status(200).json({
        success: true,
        data: rewards.toJSON(),
        message: 'Reward program activated successfully'
      });
    } catch (error) {
      console.error('Error in activateRewards:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get reward programs by type
  static async getRewardByType(req, res) {
    try {
      const { type } = req.params;

      const validTypes = ['achievement', 'milestone', 'monthly', 'weekly'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reward type. Must be one of: achievement, milestone, monthly, weekly'
        });
      }

      const rewardss = await Rewards.findByType(type);

      res.status(200).json({
        success: true,
        data: rewardss.map(program => program.toJSON()),
        message: `Reward programs of type '${type}' retrieved successfully`
      });
    } catch (error) {
      console.error('Error in getRewardssByType:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get active reward programs
  static async getActiveRewards(req, res) {
    try {
      const activePrograms = await Rewards.findActive();

      res.status(200).json({
        success: true,
        data: activePrograms.map(program => program.toJSON()),
        message: 'Active reward programs retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getActiveRewardss:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get reward program statistics
  static async getRewardStats(req, res) {
    try {
      const totalCount = await Rewards.count();
      const activeCount = await Rewards.count({ is_active: true });
      const inactiveCount = await Rewards.count({ is_active: false });

      // Get count by type
      const achievementCount = await Rewards.count({ reward_type: 'achievement' });
      const milestoneCount = await Rewards.count({ reward_type: 'milestone' });
      const monthlyCount = await Rewards.count({ reward_type: 'monthly' });
      const weeklyCount = await Rewards.count({ reward_type: 'weekly' });

      res.status(200).json({
        success: true,
        data: {
          total: totalCount,
          active: activeCount,
          inactive: inactiveCount,
          by_type: {
            achievement: achievementCount,
            milestone: milestoneCount,
            monthly: monthlyCount,
            weekly: weeklyCount
          }
        },
        message: 'Reward program statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getRewardsStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = RewardController;