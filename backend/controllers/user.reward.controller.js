const RewardAssignmentService = require("../service/reward.assignment.service");
const UserRewards = require("../models/UserRewards");
const Rewards = require("../models/Rewards");

class RewardsController {
  constructor() {
    this.rewardService = new RewardAssignmentService();
  }

  // Assign rewards to a specific user
  async assignRewardsToUser(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await this.rewardService.assignRewardsToUser(userId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Rewards assigned successfully",
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in assignRewardsToUser:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Assign rewards to all users (bulk operation)
  async assignRewardsToAllUsers(req, res) {
    try {
      const result = await this.rewardService.assignRewardsToAllUsers();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Rewards assigned to all users successfully",
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in assignRewardsToAllUsers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user's reward dashboard
  async getUserRewardDashboard(req, res) {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await this.rewardService.getUserRewardDashboard(userId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "User reward dashboard retrieved successfully",
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in getUserRewardDashboard:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user progress for specific reward type
  async updateUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const { rewardType, progress } = req.body;

      if (!userId || !rewardType || progress === undefined) {
        return res.status(400).json({
          success: false,
          message: "User ID, reward type, and progress are required",
        });
      }

      const result = await this.rewardService.updateUserProgress(
        userId,
        rewardType,
        progress
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "User progress updated successfully",
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in updateUserProgress:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Claim a reward
  async claimReward(req, res) {
    try {
      const { userRewardId } = req.params;

      if (!userRewardId) {
        return res.status(400).json({
          success: false,
          message: "User reward ID is required",
        });
      }

      const userReward = await UserRewards.findById(userRewardId);

      if (!userReward) {
        return res.status(404).json({
          success: false,
          message: "User reward not found",
        });
      }

      await userReward.claim();

      return res.status(200).json({
        success: true,
        message: "Reward claimed successfully",
        data: userReward,
      });
    } catch (error) {
      console.error("Error in claimReward:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all user rewards with filters
  async getUserRewards(req, res) {
    try {
      const userId = req.user.id;
      const { status, reward_type, limit, offset } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const filters = {
        user_id: userId,
        ...(status && { status }),
        ...(limit && { limit }),
        ...(offset && { offset }),
      };

      const userRewards = await UserRewards.findAll(filters);

      return res.status(200).json({
        success: true,
        message: "User rewards retrieved successfully",
        data: userRewards,
      });
    } catch (error) {
      console.error("Error in getUserRewards:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async calculateBussiness(req, res) {
    try {
      const userId = req.user.id;

      const { userReward, businessData } =
        await UserRewards.calculateBusinessProgress(userId);

      res.status(200).json({
        success: true,
        message: "Business calculated successfully",
        data: {
          userReward,
          businessData,
        },
      });
    } catch (error) {
      console.error("Error in calculateBussiness:", error);
      res.status(500).json({
        success: false,
        message: "Failed to calculate business",
        error: error.message,
      });
    }
  }

  // Get user reward statistics
  async getUserRewardStats(req, res) {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const stats = await UserRewards.getUserRewardStats(userId);

      return res.status(200).json({
        success: true,
        message: "User reward statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getUserRewardStats:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Cleanup expired rewards
  async cleanupExpiredRewards(req, res) {
    try {
      const result = await this.rewardService.cleanupExpiredRewards();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Expired rewards cleaned up successfully",
          data: result,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in cleanupExpiredRewards:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Check rewards system status
  async getRewardsSystemStatus(req, res) {
    try {
      const isEnabled = await this.rewardService.isRewardsEnabled();
      const enabledTypes = await this.rewardService.getEnabledRewardTypes();

      return res.status(200).json({
        success: true,
        message: "Rewards system status retrieved successfully",
        data: {
          enabled: isEnabled,
          enabled_types: enabledTypes,
        },
      });
    } catch (error) {
      console.error("Error in getRewardsSystemStatus:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all available reward programs
  async getAvailableRewardPrograms(req, res) {
    try {
      const { reward_type, is_active } = req.query;

      const filters = {
        ...(reward_type && { reward_type }),
        ...(is_active !== undefined && { is_active: is_active === "true" }),
      };

      const rewardPrograms = await Rewards.findAll(filters);

      return res.status(200).json({
        success: true,
        message: "Available reward programs retrieved successfully",
        data: rewardPrograms,
      });
    } catch (error) {
      console.error("Error in getAvailableRewardPrograms:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = RewardsController;
