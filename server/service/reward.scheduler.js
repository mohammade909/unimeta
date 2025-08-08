const RewardAssignmentService = require("./reward.assignment.service");
const UserRewards = require("../models/UserRewards");
const cron = require("node-cron");
const User = require("../models/User");
const WeeklySalaryProcessor = require('../service/weeklySalaryProcesser');
class RewardUtilities {
  constructor() {
    this.rewardService = new RewardAssignmentService();
  }
  // Manual script to assign rewards to all existing users
  async assignRewardsToExistingUsers() {
    try {
      console.log("Starting reward assignment for existing users...");

      const result = await this.rewardService.assignRewardsToAllUsers();

      if (result.success) {
        console.log(`Successfully processed ${result.total_users} users`);

        // Log summary
        let successCount = 0;
        let errorCount = 0;

        result.results.forEach((userResult) => {
          if (userResult.result.success) {
            successCount++;
            console.log(
              `✓ User ${userResult.user_id} (${userResult.username}): ${userResult.result.assigned_rewards.length} rewards assigned`
            );
          } else {
            errorCount++;
            console.log(
              `✗ User ${userResult.user_id} (${userResult.username}): ${userResult.result.message}`
            );
          }
        });

        console.log(
          `\nSummary: ${successCount} successful, ${errorCount} errors`
        );
      } else {
        console.error("Failed to assign rewards:", result.message);
      }
    } catch (error) {
      console.error("Error in assignRewardsToExistingUsers:", error);
    }
  }

  // Update user progress based on business metrics
  async updateUserBusinessProgress(userId, businessAmount) {
    try {
      const result = await this.rewardService.updateUserProgress(
        userId,
        "achievement",
        businessAmount
      );

      console.log(`user ${userId} result `,result)
      if (result.success) {
        console.log(
          `Updated business progress for user ${userId}: ${businessAmount}`
        );

        // Check for newly achieved rewards
        result.updated_rewards.forEach((reward) => {
          if (reward.status === "achieved") {
            console.log(
              `🎉 User ${userId} achieved reward: ${reward.reward_program_id}`
            );
          }
        });
      }

      return result;
    } catch (error) {
      console.error("Error updating user business progress:", error);
      return { success: false, message: error.message };
    }
  }

  // Update user referral progress
  async updateUserReferralProgress(userId, referralCount) {
    try {
      const result = await this.rewardService.updateUserProgress(
        userId,
        "milestone",
        referralCount
      );

      if (result.success) {
        console.log(
          `Updated referral progress for user ${userId}: ${referralCount}`
        );

        // Check for newly achieved rewards
        result.updated_rewards.forEach((reward) => {
          if (reward.status === "achieved") {
            console.log(
              `🎉 User ${userId} achieved referral reward: ${reward.reward_program_id}`
            );
          }
        });
      }

      return result;
    } catch (error) {
      console.error("Error updating user referral progress:", error);
      return { success: false, message: error.message };
    }
  }

  // Get reward leaderboard
  async getRewardLeaderboard(limit = 10) {
    try {
      const sql = `
        SELECT 
          u.id, u.username, u.full_name,
          COUNT(ur.id) as total_rewards,
          SUM(CASE WHEN ur.status = 'achieved' THEN 1 ELSE 0 END) as achieved_rewards,
          SUM(CASE WHEN ur.status = 'claimed' THEN 1 ELSE 0 END) as claimed_rewards,
          SUM(CASE WHEN ur.status = 'claimed' THEN ur.reward_amount ELSE 0 END) as total_earned
        FROM users u
        LEFT JOIN user_rewards ur ON u.id = ur.user_id
        GROUP BY u.id, u.username, u.full_name
        ORDER BY total_earned DESC, achieved_rewards DESC
        LIMIT ?
      `;

      const results = await database.query(sql, [limit]);
      return results;
    } catch (error) {
      console.error("Error getting reward leaderboard:", error);
      return [];
    }
  }

  // Generate reward report
  async generateRewardReport() {
    try {
      const sql = `
        SELECT 
          rp.title as reward_title,
          rp.reward_type,
          COUNT(ur.id) as total_assignments,
          SUM(CASE WHEN ur.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN ur.status = 'achieved' THEN 1 ELSE 0 END) as achieved,
          SUM(CASE WHEN ur.status = 'claimed' THEN 1 ELSE 0 END) as claimed,
          SUM(CASE WHEN ur.status = 'expired' THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN ur.status = 'claimed' THEN ur.reward_amount ELSE 0 END) as total_paid_out,
          AVG(ur.achievement_percentage) as avg_progress
        FROM reward_programs rp
        LEFT JOIN user_rewards ur ON rp.id = ur.reward_program_id
        WHERE rp.is_active = true
        GROUP BY rp.id, rp.title, rp.reward_type
        ORDER BY total_assignments DESC
      `;

      const results = await database.query(sql);
      return results;
    } catch (error) {
      console.error("Error generating reward report:", error);
      return [];
    }
  }

  calculateBusinessLegsWeight(businessData) {
    // Extract leg business data
    const legBusiness = businessData.legBusiness;

    if (!legBusiness || !legBusiness.legs) {
      return {
        error: "No leg business data found",
      };
    }

    const legs = legBusiness.legs;
    let totalWeightedBusiness = 0;
    const legDetails = [];

    // Process each leg dynamically
    Object.keys(legs).forEach((legName) => {
      const leg = legs[legName];
      const weightedBusiness = leg.weightedBusiness || 0;

      totalWeightedBusiness += weightedBusiness;

      legDetails.push({
        legName: legName,
        ratio: leg.ratio,
        business: leg.business,
        weightedBusiness: weightedBusiness,
        members: leg.members || [],
      });
    });

    return totalWeightedBusiness;
  }
  // Start reward scheduler
  startRewardScheduler() {
    // const processor = new WeeklySalaryProcessor();
    console.log("Starting reward scheduler...");

    // Cleanup expired rewards daily at 2 AM
    // cron.schedule('* * * * * *', async () => {
    //   console.log('Running daily expired rewards cleanup...');
    //   try {
    //     const result = await this.rewardService.cleanupExpiredRewards();
    //     console.log(`Cleaned up ${result.cleaned_count} expired rewards`);
    //   } catch (error) {
    //     console.error('Error in scheduled cleanup:', error);
    //   }
    // });

    // Generate weekly reward report (every Sunday at 9 AM)
    // cron.schedule('* * * * * *', async () => {
    //   console.log('Generating weekly reward report...');
    //   try {
    //     const report = await this.generateRewardReport();
    //     console.log('Weekly Reward Report:', report);

    //     // You can send this report via email or save to file
    //     // await this.sendReportEmail(report);
    //   } catch (error) {
    //     console.error('Error generating weekly report:', error);
    //   }
    // });

    // Check and update reward progress (every hour)
    cron.schedule("* * * * *", async () => {
      console.log("Checking reward progress...");
      try {
        // This is where you would implement automatic progress updates
        // based on your business logic and data sources

        // Example: Update business progress for all users
        const { users } = await User.findAll();
        // console.log(users)
        for (const user of users) {
          const { userReward, businessData } =
            await UserRewards.calculateBusinessProgress(user.id);
          const businessAmount = this.calculateBusinessLegsWeight(businessData);
          // console.log(`User ${user.id},  bussiness = > ${ businessAmount} amount`)
          await this.updateUserBusinessProgress(user.id, businessAmount);
        }

        console.log("Reward progress check completed");
      } catch (error) {
        console.error("Error in reward progress check:", error);
      }
    });

    console.log("Reward scheduler started successfully");

    cron.schedule('* * * * *', async () => {
      console.log('Starting weekly salary processing...');
      try {
        const result = await processor.processWeeklySalaryForAllUsers();
        console.log('Weekly salary processing result:', result);
      } catch (error) {
        console.error('Weekly salary processing failed:', error.message);
      }
    });
  }

  // Stop reward scheduler
  stopRewardScheduler() {
    console.log("Stopping reward scheduler...");
    cron.getTasks().forEach((task) => task.stop());
    console.log("Reward scheduler stopped");
  }

  // Manual reward assignment for specific user
  async manualRewardAssignment(userId, rewardProgramId, progress = 0) {
    try {
      // Check if user already has this reward
      const existingReward = await UserRewards.userHasRewardProgram(
        userId,
        rewardProgramId
      );
      if (existingReward) {
        throw new Error("User already has this reward program");
      }

      // Get reward program details
      const rewardProgram = await Rewards.findById(rewardProgramId);
      if (!rewardProgram) {
        throw new Error("Reward program not found");
      }

      // Calculate required target
      const requiredTarget =
        this.rewardService.calculateRequiredTarget(rewardProgram);

      // Calculate expiration date
      const expiresAt =
        this.rewardService.calculateExpirationDate(rewardProgram);

      // Create user reward
      const userReward = new UserRewards({
        user_id: userId,
        reward_program_id: rewardProgramId,
        current_progress: progress,
        required_target: requiredTarget,
        achievement_percentage: (progress / requiredTarget) * 100,
        status: progress >= requiredTarget ? "achieved" : "in_progress",
        achieved_at: progress >= requiredTarget ? new Date() : null,
        expires_at: expiresAt,
        reward_amount:
          progress >= requiredTarget ? rewardProgram.reward_amount || 0 : 0,
      });

      await userReward.save();

      console.log(
        `Manual reward assigned to user ${userId}: ${rewardProgram.title}`
      );
      return { success: true, userReward };
    } catch (error) {
      console.error("Error in manual reward assignment:", error);
      return { success: false, message: error.message };
    }
  }

  // Bulk update progress for multiple users
  async bulkUpdateProgress(updates) {
    try {
      const results = [];

      for (const update of updates) {
        const { userId, rewardType, progress } = update;

        try {
          const result = await this.rewardService.updateUserProgress(
            userId,
            rewardType,
            progress
          );
          results.push({
            userId,
            success: result.success,
            message: result.message || "Progress updated successfully",
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            message: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error in bulk update progress:", error);
      return [];
    }
  }

  // Export reward data for analytics
  async exportRewardData(startDate, endDate) {
    try {
      const sql = `
        SELECT 
          u.id as user_id,
          u.username,
          u.email,
          rp.title as reward_title,
          rp.reward_type,
          ur.current_progress,
          ur.required_target,
          ur.achievement_percentage,
          ur.status,
          ur.achieved_at,
          ur.claimed_at,
          ur.expires_at,
          ur.reward_amount,
          ur.created_at
        FROM user_rewards ur
        JOIN users u ON ur.user_id = u.id
        JOIN reward_programs rp ON ur.reward_program_id = rp.id
        WHERE ur.created_at BETWEEN ? AND ?
        ORDER BY ur.created_at DESC
      `;

      const results = await database.query(sql, [startDate, endDate]);
      return results;
    } catch (error) {
      console.error("Error exporting reward data:", error);
      return [];
    }
  }
}

// Usage examples and initialization
const rewardUtilities = new RewardUtilities();

// Export functions for use in other modules
module.exports = {
  RewardUtilities,
  rewardUtilities,
  // Initialize reward system
  async initializeRewardSystem() {
    try {
      console.log("Initializing reward system...");

      // Start the scheduler
      rewardUtilities.startRewardScheduler();

      // Assign rewards to existing users (run once)
      // await rewardUtilities.assignRewardsToExistingUsers();

      console.log("Reward system initialized successfully");
    } catch (error) {
      console.error("Error initializing reward system:", error);
    }
  },

  // Manual functions for admin use
  async assignRewardsToAllUsers() {
    return await rewardUtilities.assignRewardsToExistingUsers();
  },

  async generateRewardReport() {
    return await rewardUtilities.generateRewardReport();
  },

  async getRewardLeaderboard(limit = 10) {
    return await rewardUtilities.getRewardLeaderboard(limit);
  },

  async updateUserBusinessProgress(userId, businessAmount) {
    return await rewardUtilities.updateUserBusinessProgress(
      userId,
      businessAmount
    );
  },

  async updateUserReferralProgress(userId, referralCount) {
    return await rewardUtilities.updateUserReferralProgress(
      userId,
      referralCount
    );
  },

  async exportRewardData(startDate, endDate) {
    return await rewardUtilities.exportRewardData(startDate, endDate);
  },
};
