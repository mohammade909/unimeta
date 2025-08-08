const UserRewards = require("../models/UserRewards");
const Rewards = require("../models/Rewards");
const SystemSettings = require("../models/SystemSettings");
const Transaction = require("../models/Transaction");
const db = require("../database");
class RewardAssignmentService {
  constructor() {
    this.systemSetting = SystemSettings;
    // Remove the instantiation since we're using static methods
    // this.user = new User()
  }

  // Check if rewards system is enabled
  async isRewardsEnabled() {
    try {
      const setting = await SystemSettings.findByKey("reward_programs");
      console.log(setting);
      if (!setting || !setting.setting_value) {
        return false;
      }

      const rewardSettings =
        typeof setting.setting_value === "string"
          ? JSON.parse(setting.setting_value)
          : setting.setting_value;

      return rewardSettings.enabled === true;
    } catch (error) {
      console.error("Error checking rewards system status:", error);
      return false;
    }
  }

  async getAllUsers() {
    const sql = `
      SELECT id, username, email, full_name, status, created_at
      FROM users 
      WHERE status = ?
      ORDER BY created_at DESC
    `;

    try {
      return await db.query(sql, ["active"]);
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }
  // Get enabled reward types from system settings
  async getEnabledRewardTypes() {
    try {
      const setting = await SystemSettings.findByKey("rewards_programs");
      if (!setting || !setting.setting_value) {
        return [];
      }

      const rewardSettings =
        typeof setting.setting_value === "string"
          ? JSON.parse(setting.setting_value)
          : setting.setting_value;

      const enabledTypes = [];
      ["achievement", "milestone", "monthly", "weekly"].forEach((type) => {
        if (rewardSettings[type] === true) {
          enabledTypes.push(type);
        }
      });

      return enabledTypes;
    } catch (error) {
      console.error("Error getting enabled reward types:", error);
      return [];
    }
  }

  // Assign only achievement rewards to a specific user
  async assignRewardsToUser(userId) {
    try {
      // Check if rewards system is enabled
      if (!(await this.isRewardsEnabled())) {
        console.log("Rewards system is disabled");
        return { success: false, message: "Rewards system is disabled" };
      }

      // Get all active achievement-type reward programs
      const rewardPrograms = await Rewards.findAll({
        is_active: true,
        reward_type: "achievement",
      });

      if (!rewardPrograms.length) {
        console.log("No active achievement reward programs found");
        return {
          success: false,
          message: "No active achievement reward programs found",
        };
      }

      const assignedRewards = [];
      const errors = [];

      for (const rewardProgram of rewardPrograms) {
        try {
          // Check if the user already has this reward
          const alreadyAssigned = await UserRewards.userHasRewardProgram(
            userId,
            rewardProgram.id
          );

          if (alreadyAssigned) {
            console.log(
              `User ${userId} already has reward program ${rewardProgram.id}`
            );
            continue;
          }

          // Calculate required target based on thresholds
          const requiredTarget = this.calculateRequiredTarget(rewardProgram);

          // Calculate expiration date
          const expiresAt = this.calculateExpirationDate(rewardProgram);

          // Create and save user reward
          const userReward = new UserRewards({
            user_id: userId,
            reward_program_id: rewardProgram.id,
            current_progress: 0,
            required_target: requiredTarget,
            achievement_percentage: 0,
            status: "in_progress",
            expires_at: expiresAt,
            reward_amount: rewardProgram.reward_amount,
          });

          await userReward.save();

          assignedRewards.push({
            reward_program_id: rewardProgram.id,
            title: rewardProgram.title,
            user_reward_id: userReward.id,
          });
        } catch (error) {
          errors.push({
            reward_program_id: rewardProgram.id,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        assigned_rewards: assignedRewards,
        errors: errors,
      };
    } catch (error) {
      console.error("Error assigning achievement rewards to user:", error);
      return { success: false, message: error.message };
    }
  }

  // Assign rewards to all users (bulk operation) - FIXED VERSION
  async assignRewardsToAllUsers() {
    try {
      // Check if rewards system is enabled
      if (!(await this.isRewardsEnabled())) {
        return { success: false, message: "Rewards system is disabled" };
      }

      // Get all users using the static method with proper options
      const userResult = await this.getAllUsers();

      // Extract users array from the result
      const users = userResult || [];

      if (!users.length) {
        return { success: false, message: "No users found" };
      }

      const results = [];

      for (const user of users) {
        const result = await this.assignRewardsToUser(user.id);
        results.push({
          user_id: user.id,
          username: user.username,
          result: result,
        });
      }

      return {
        success: true,
        total_users: users.length,
        results: results,
      };
    } catch (error) {
      console.error("Error assigning rewards to all users:", error);
      return { success: false, message: error.message };
    }
  }

  // Alternative method if you want to get users without pagination
  async assignRewardsToAllUsersSimple() {
    try {
      // Check if rewards system is enabled
      if (!(await this.isRewardsEnabled())) {
        return { success: false, message: "Rewards system is disabled" };
      }

      // Direct database query if you need all users without pagination
      const db = require("../config/database"); // Adjust path as needed
      const usersQuery =
        "SELECT id, username FROM users WHERE status = 'active'";
      const users = await db.query(usersQuery);

      if (!users.length) {
        return { success: false, message: "No active users found" };
      }

      const results = [];

      for (const user of users) {
        const result = await this.assignRewardsToUser(user.id);
        results.push({
          user_id: user.id,
          username: user.username,
          result: result,
        });
      }

      return {
        success: true,
        total_users: users.length,
        results: results,
      };
    } catch (error) {
      console.error("Error assigning rewards to all users:", error);
      return { success: false, message: error.message };
    }
  }

  // Calculate required target based on reward program thresholds
  calculateRequiredTarget(rewardProgram) {
    // Priority order: business_threshold > team_size_threshold > direct_referrals_threshold
    if (rewardProgram.business_threshold) {
      return rewardProgram.business_threshold;
    }
    if (rewardProgram.team_size_threshold) {
      return rewardProgram.team_size_threshold;
    }
    if (rewardProgram.direct_referrals_threshold) {
      return rewardProgram.direct_referrals_threshold;
    }

    // Default target if no thresholds are set
    return 100;
  }

  // Calculate expiration date based on reward program
  calculateExpirationDate(rewardProgram) {
    if (!rewardProgram.duration_days) {
      return null;
    }

    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() + rewardProgram.duration_days
    );

    return expirationDate;
  }

  // async updateUserProgress(userId, rewardType, newProgress) {
  //   try {
  //     // Get user rewards for specific reward type
  //     const userRewards = await UserRewards.findAll({
  //       user_id: userId,
  //       status: "in_progress",
  //     });
  //     const updatedRewards = [];

  //     for (const userReward of userRewards) {
  //       // Get reward program to check type
  //       const rewardProgram = await Rewards.findById(
  //         userReward.reward_program_id
  //       );

  //       if (rewardProgram && rewardProgram.reward_type === rewardType) {
  //         // Check if expired (uncomment if needed)
  //         // if (userReward.isExpired()) {
  //         //   await userReward.markExpired();
  //         //   continue;
  //         // }

  //         // Log current state before update

  //         // Update progress - this will automatically update percentage and status
  //         await userReward.updateProgress(newProgress);

  //         // Calculate reward amount if achieved
  //         if (userReward.status === "achieved") {
  //           userReward.reward_amount =
  //             userReward.calculateRewardAmount(rewardProgram);
  //           // Save the reward amount update
  //           await userReward.update();
  //         }

  //         updatedRewards.push(userReward);
  //       }
  //     }

  //     return {
  //       success: true,
  //       updated_rewards: updatedRewards,
  //     };
  //   } catch (error) {
  //     console.error("Error updating user progress:", error);
  //     return { success: false, message: error.message };
  //   }
  // }

  // Get user's reward dashboard

  async updateUserProgress(userId, rewardType, newProgress) {
    const connection = await db.beginTransaction();

    try {
      const userRewards = await UserRewards.findAll({
        user_id: userId,
        status: "in_progress",
      });
      const updatedRewards = [];

      for (const userReward of userRewards) {
        const rewardProgram = await Rewards.findById(
          userReward.reward_program_id
        );

        if (rewardProgram && rewardProgram.reward_type === rewardType) {
          const previousStatus = userReward.status;

          await userReward.updateProgress(newProgress);

          if (userReward.status === "achieved") {
            userReward.reward_amount =
              userReward.calculateRewardAmount(rewardProgram);
            await userReward.update();

            // Create transaction within the same database transaction
            // if (previousStatus !== "achieved") {
            //   await this.addTransaction(
            //     userId,
            //     userReward,
            //     rewardProgram,
            //     connection
            //   );
            // }
          }

          updatedRewards.push(userReward);
        }
      }

      await db.commitTransaction(connection);

      return {
        success: true,
        updated_rewards: updatedRewards,
      };
    } catch (error) {
      await db.rollbackTransaction(connection);
      console.error("Error updating user progress with transaction:", error);
      return { success: false, message: error.message };
    }
  }

  async addTransaction(userId, userReward, rewardProgram, connection) {
  try {
    const transactionData = {
      user_id: userId,
      transaction_type: "reward_bonus",
      amount: userReward.reward_amount,
      fee_amount: 0.0,
      net_amount: userReward.reward_amount,
      currency: "USD",
      status: "completed",
      source_type: "internal",
      source_details: JSON.stringify({
        reward_program_id: rewardProgram.id,
        reward_program_name: rewardProgram.name || rewardProgram.title,
        reward_type: rewardProgram.reward_type,
        achievement_percentage: userReward.achievement_percentage,
        target_achieved: userReward.required_target,
        achievement_date: userReward.achieved_at
      }),
      processed_by: 1,
      processed_at: new Date(),
      admin_notes: `Reward achieved: ${rewardProgram.name || rewardProgram.title} - Amount: ${userReward.reward_amount}`
    };

    const transaction = new Transaction(transactionData);
    await transaction.create(connection); // Use the provided connection
    
    return transaction;
  } catch (error) {
    console.error("Error creating reward transaction with connection:", error);
    throw error;
  }
}


  async getUserRewardDashboard(userId) {
    try {
      const userRewards = await UserRewards.findByUserId(userId);
      const stats = await UserRewards.getUserRewardStats(userId);

      return {
        success: true,
        stats: stats,
        rewards: userRewards,
      };
    } catch (error) {
      console.error("Error getting user reward dashboard:", error);
      return { success: false, message: error.message };
    }
  }

  // Cleanup expired rewards
  async cleanupExpiredRewards() {
    try {
      const expiredRewards = await UserRewards.findAll({
        status: "in_progress",
      });

      let cleanedCount = 0;

      for (const reward of expiredRewards) {
        if (reward.isExpired()) {
          await reward.markExpired();
          cleanedCount++;
        }
      }

      return {
        success: true,
        cleaned_count: cleanedCount,
      };
    } catch (error) {
      console.error("Error cleaning up expired rewards:", error);
      return { success: false, message: error.message };
    }
  }

  // Auto-assign rewards when user is created (to be called from User.create)
  async autoAssignRewardsOnUserCreation(userId) {
    try {
      // Small delay to ensure user is fully created
      setTimeout(async () => {
        await this.assignRewardsToUser(userId);
      }, 1000);

      return { success: true };
    } catch (error) {
      console.error("Error auto-assigning rewards on user creation:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = RewardAssignmentService;
