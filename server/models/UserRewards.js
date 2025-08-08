const database = require("../database");
const RewardBusinessCalculator = require("../service/bussiness.calculator");

class UserRewards {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.reward_program_id = data.reward_program_id || null;
    this.current_progress = data.current_progress || 0.0;
    this.required_target = data.required_target || 0.0;
    this.achievement_percentage = data.achievement_percentage || 0.0;
    this.status = data.status || "in_progress";
    this.achieved_at = data.achieved_at || null;
    this.claimed_at = data.claimed_at || null;
    this.expires_at = data.expires_at || null;
    this.reward_amount = data.reward_amount || 0.0;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push("User ID is required");
    }

    if (!this.reward_program_id) {
      errors.push("Reward program ID is required");
    }

    if (this.required_target < 0) {
      errors.push("Required target cannot be negative");
    }

    if (this.current_progress < 0) {
      errors.push("Current progress cannot be negative");
    }
    if (this.current_progress > this.required_target) {
      this.current_progress = this.required_target;
      this.achievement_percentage = 100
    }

    if (this.achievement_percentage < 0 || this.achievement_percentage > 100) {
      errors.push("Achievement percentage must be between 0 and 100");
    }

    const validStatuses = ["in_progress", "achieved", "expired", "claimed"];
    if (!validStatuses.includes(this.status)) {
      errors.push("Invalid status");
    }

    return errors;
  }

  // Create a new user reward
  async save() {
    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const sql = `
      INSERT INTO user_rewards (
        user_id, reward_program_id, current_progress, required_target,
        achievement_percentage, status, achieved_at, claimed_at, expires_at, reward_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.user_id,
      this.reward_program_id,
      this.current_progress,
      this.required_target,
      this.achievement_percentage,
      this.status,
      this.achieved_at,
      this.claimed_at,
      this.expires_at,
      this.reward_amount,
    ];

    try {
      const result = await database.query(sql, params);
      this.id = result.insertId;
      return this;
    } catch (error) {
      throw new Error(`Error creating user reward: ${error.message}`);
    }
  }

  async updateUserProgress(userId, rewardType, newProgress) {
    console.log("helloo progrese");
    // try {
    //   // Validate input parameters
    //   if (
    //     !userId ||
    //     !rewardType ||
    //     newProgress === undefined ||
    //     newProgress === null
    //   ) {
    //     throw new Error("Missing required parameters");
    //   }

    //   // Get user rewards for specific reward type
    //   const userRewards = await UserRewards.findAll({
    //     user_id: userId,
    //     status: "in_progress",
    //   });

    //   if (!userRewards || userRewards.length === 0) {
    //     return {
    //       success: true,
    //       message: "No active rewards found for user",
    //       updated_rewards: [],
    //     };
    //   }

    //   const updatedRewards = [];

    //   for (const userReward of userRewards) {
    //     try {
    //       // Get reward program to check type
    //       const rewardProgram = await Rewards.findById(
    //         userReward.reward_program_id
    //       );

    //           // Log current state before update
    //         console.log("Before update:", {
    //           id: userReward.id,
    //           current_progress: userReward.current_progress,
    //           required_target: userReward.required_target,
    //           achievement_percentage: userReward.achievement_percentage,
    //           newProgress: newProgress,
    //         });

    //       if (rewardProgram && rewardProgram.reward_type === rewardType) {

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

    //         console.log(
    //           `Successfully updated reward ${userReward.id} for user ${userId}`
    //         );
    //       }
    //     } catch (rewardError) {
    //       console.error(
    //         `Error updating individual reward ${userReward.id}:`,
    //         rewardError
    //       );
    //       // Continue with other rewards instead of failing completely
    //       continue;
    //     }
    //   }

    //   return {
    //     success: true,
    //     updated_rewards: updatedRewards,
    //     message: `Updated ${updatedRewards.length} reward(s)`,
    //   };
    // } catch (error) {
    //   console.error("Error updating user progress:", error);
    //   return {
    //     success: false,
    //     message: error.message,
    //     error: error.stack,
    //   };
    // }
  }

  // Your existing update method (with small modification)
  async update() {
    if (!this.id) {
      throw new Error("Cannot update user reward without ID");
    }

    const errors = this.validate();
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    const sql = `
    UPDATE user_rewards SET
      current_progress = ?, required_target = ?, achievement_percentage = ?,
      status = ?, achieved_at = ?, claimed_at = ?, expires_at = ?, reward_amount = ?
    WHERE id = ?
  `;

    const params = [
      this.current_progress,
      this.required_target,
      this.achievement_percentage,
      this.status,
      this.achieved_at,
      this.claimed_at,
      this.expires_at,
      this.reward_amount,
      this.id,
    ];

    try {
      const result = await database.query(sql, params);
      if (result.affectedRows === 0) {
        throw new Error("User reward not found");
      }
      return this;
    } catch (error) {
      throw new Error(`Error updating user reward: ${error.message}`);
    }
  }

  // Find user reward by ID
  static async findById(id) {
    const sql = "SELECT * FROM user_rewards WHERE id = ?";

    try {
      const results = await database.query(sql, [id]);
      if (results.length === 0) {
        return null;
      }
      return new UserRewards(results[0]);
    } catch (error) {
      throw new Error(`Error finding user reward: ${error.message}`);
    }
  }

  // Find all user rewards with optional filters
  static async findAll(filters = {}) {
    let sql = "SELECT * FROM user_rewards WHERE 1=1";
    const params = [];

    // Apply filters
    if (filters.user_id) {
      sql += " AND user_id = ?";
      params.push(filters.user_id);
    }

    if (filters.reward_program_id) {
      sql += " AND reward_program_id = ?";
      params.push(filters.reward_program_id);
    }

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.achieved_at) {
      sql += " AND achieved_at >= ?";
      params.push(filters.achieved_at);
    }

    // Add pagination
    if (filters.limit) {
      sql += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      sql += " OFFSET ?";
      params.push(parseInt(filters.offset));
    }

    // Add ordering
    sql += " ORDER BY created_at DESC";

    try {
      const results = await database.query(sql, params);
      return results.map((row) => new UserRewards(row));
    } catch (error) {
      throw new Error(`Error finding user rewards: ${error.message}`);
    }
  }

  // Find user rewards by user ID
  static async findByUserId(userId) {
    const sql = `
      SELECT ur.*, rp.title as reward_title, rp.description as reward_description
      FROM user_rewards ur
      JOIN reward_programs rp ON ur.reward_program_id = rp.id
      WHERE ur.user_id = ?
      ORDER BY ur.created_at DESC
    `;

    try {
      const results = await database.query(sql, [userId]);
      return results.map((row) => new UserRewards(row));
    } catch (error) {
      throw new Error(
        `Error finding user rewards by user ID: ${error.message}`
      );
    }
  }

  // Check if user already has a specific reward program
  static async userHasRewardProgram(userId, rewardProgramId) {
    const sql =
      "SELECT COUNT(*) as count FROM user_rewards WHERE user_id = ? AND reward_program_id = ?";

    try {
      const results = await database.query(sql, [userId, rewardProgramId]);
      return results[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking user reward program: ${error.message}`);
    }
  }

  // Update progress for user reward
  async updateProgress(newProgress) {
    this.current_progress = newProgress;
    this.achievement_percentage =
      (this.current_progress / this.required_target) * 100;

    // Check if achieved
    if (this.achievement_percentage >= 100) {
      this.status = "achieved";
      this.achieved_at = new Date();
    }

    return await this.update();
  }

  static async calculateBusinessProgress(
    userId,
    startDate = null,
    endDate = null
  ) {
    try {
      const businessData = await RewardBusinessCalculator.calculateTeamBusiness(
        userId,
        startDate,
        endDate
      );

      // Update current progress based on business calculation
      this.current_progress = businessData.totalBusiness;

      // Calculate achievement percentage
      if (this.required_target > 0) {
        this.achievement_percentage = Math.min(
          (this.current_progress / this.required_target) * 100,
          100
        );
      }

      // Update status based on achievement
      if (this.achievement_percentage >= 100 && this.status === "in_progress") {
        this.status = "achieved";
        this.achieved_at = new Date();
      }

      // Save the updated progress
      // if (this.id) {
      //   await this.update();
      // } else {
      //   await this.save();
      // }

      return {
        userReward: this,
        businessData,
      };
    } catch (error) {
      throw new Error(`Error calculating business progress: ${error.message}`);
    }
  }

  // Get detailed business report for this reward
  static async getBusinessReport(startDate = null, endDate = null) {
    try {
      const report = await RewardBusinessCalculator.getBusinessReport(
        this.user_id,
        startDate,
        endDate
      );

      return {
        reward: this,
        businessReport: report,
      };
    } catch (error) {
      throw new Error(`Error getting business report: ${error.message}`);
    }
  }

  static async getBusinessLeaderboard(rewardProgramId, limit = 10) {
    const sql = `
      SELECT 
        ur.*,
        u.username,
        u.full_name,
        u.profile_image
      FROM user_rewards ur
      JOIN users u ON ur.user_id = u.id
      WHERE ur.reward_program_id = ?
      ORDER BY ur.current_progress DESC, ur.achievement_percentage DESC
      LIMIT ?
    `;

    try {
      const results = await database.query(sql, [rewardProgramId, limit]);
      return results.map((row) => ({
        reward: new UserRewards(row),
        user: {
          username: row.username,
          full_name: row.full_name,
          profile_image: row.profile_image,
        },
      }));
    } catch (error) {
      throw new Error(`Error getting business leaderboard: ${error.message}`);
    }
  }

  // Calculate reward amount based on progress
  calculateRewardAmount(rewardProgram) {
    if (this.achievement_percentage >= 100) {
      if (rewardProgram.reward_amount) {
        return rewardProgram.reward_amount;
      } else if (rewardProgram.reward_percentage) {
        // Calculate percentage-based reward (you might need to define base amount)
        const baseAmount = this.required_target; // or any other base calculation
        return (baseAmount * rewardProgram.reward_percentage) / 100;
      }
    }
    return 0;
  }

  // Mark reward as claimed
  async claim() {
    if (this.status !== "achieved") {
      throw new Error("Cannot claim reward that is not achieved");
    }

    this.status = "claimed";
    this.claimed_at = new Date();
    return await this.update();
  }

  // Check if reward is expired
  isExpired() {
    if (this.expires_at) {
      return new Date() > new Date(this.expires_at);
    }
    return false;
  }

  // Mark reward as expired
  async markExpired() {
    this.status = "expired";
    return await this.update();
  }

  // Get user reward statistics
  static async getUserRewardStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_rewards,
        SUM(CASE WHEN status = 'achieved' THEN 1 ELSE 0 END) as achieved_rewards,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed_rewards,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_rewards,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_rewards,
        SUM(CASE WHEN status = 'claimed' THEN reward_amount ELSE 0 END) as total_claimed_amount
      FROM user_rewards 
      WHERE user_id = ?
    `;

    try {
      const results = await database.query(sql, [userId]);
      return results[0];
    } catch (error) {
      throw new Error(`Error getting user reward stats: ${error.message}`);
    }
  }
}

module.exports = UserRewards;
