const database = require('../database');
const SystemSettings = require('../models/SystemSettings'); // Assuming you have this model

class RewardBusinessCalculator {

  static async calculateTeamBusiness(userId, startDate = null, endDate = null) {
    try {
      // Get system settings for reward programs
      let rewardSettings = await SystemSettings.getValueByKey('reward_programs');
         
      rewardSettings = typeof rewardSettings ==="string" ? JSON.parse(rewardSettings) : rewardSettings
      
      // Get user's complete team structure with nested levels
      const teamStructure = await this.getNestedTeamStructure(userId);
      
      // Calculate business for each team member recursively
      const businessResults = {
        directBusiness: 0,
        teamBusiness: 0,
        personalBusiness: 0,
        totalBusiness: 0,
        teamLevels: {},
        memberCount: 0,
        legBusiness: {}, // For ratio-based leg calculation
        nestedStructure: teamStructure
      };

      // Calculate personal business (user's own investments)
      businessResults.personalBusiness = await this.calculatePersonalBusiness(userId, startDate, endDate);
      
      // Calculate nested team business
      const nestedBusinessData = await this.calculateNestedBusiness(teamStructure, startDate, endDate);
      businessResults.teamBusiness = nestedBusinessData.totalTeamBusiness;
      businessResults.teamLevels = nestedBusinessData.levelBusiness;
      businessResults.memberCount = nestedBusinessData.totalMembers;
      
      // Calculate direct business (level 1 only)
      businessResults.directBusiness = businessResults.teamLevels[1]?.business || 0;
      
      // Calculate leg-based business using ratio
      businessResults.legBusiness = await this.calculateLegBusiness(userId, rewardSettings, startDate, endDate);
      
      // Total business is personal + team business
      businessResults.totalBusiness = businessResults.personalBusiness + businessResults.teamBusiness;
      
      return businessResults;
    } catch (error) {
      throw new Error(`Error calculating team business: ${error.message}`);
    }
  }

  static async getNestedTeamStructure(userId) {
    try {
      const sql = `
        WITH RECURSIVE team_hierarchy AS (
          -- Base case: direct referrals
          SELECT 
            user_id,
            parent_id,
            level,
            path,
            direct_referrals,
            total_team_size,
            active_team_size,
            team_business,
            1 as depth
          FROM user_mlm_tree 
          WHERE parent_id = ?
          
          UNION ALL
          
          -- Recursive case: get children of each member
          SELECT 
            umt.user_id,
            umt.parent_id,
            umt.level,
            umt.path,
            umt.direct_referrals,
            umt.total_team_size,
            umt.active_team_size,
            umt.team_business,
            th.depth + 1
          FROM user_mlm_tree umt
          INNER JOIN team_hierarchy th ON umt.parent_id = th.user_id
          WHERE th.depth < 10 -- Prevent infinite recursion
        )
        SELECT * FROM team_hierarchy
        ORDER BY level, user_id
      `;
      
      const results = await database.query(sql, [userId]);
      return this.buildTreeStructure(results);
    } catch (error) {
      throw new Error(`Error getting nested team structure: ${error.message}`);
    }
  }

  static buildTreeStructure(flatData) {
    const userMap = new Map();
    const rootChildren = [];

    // Create user objects and map them
    flatData.forEach(user => {
      userMap.set(user.user_id, {
        ...user,
        children: []
      });
    });

    // Build the tree structure
    flatData.forEach(user => {
      const userObj = userMap.get(user.user_id);
      
      if (user.parent_id && userMap.has(user.parent_id)) {
        // Add to parent's children
        const parent = userMap.get(user.parent_id);
        parent.children.push(userObj);
      } else {
        // This is a root level user (direct referral)
        rootChildren.push(userObj);
      }
    });

    return rootChildren;
  }

  static async calculateNestedBusiness(teamStructure, startDate = null, endDate = null) {
    const levelBusiness = {};
    let totalTeamBusiness = 0;
    let totalMembers = 0;

    const processNode = async (node, currentLevel = 1) => {
      // Initialize level if not exists
      if (!levelBusiness[currentLevel]) {
        levelBusiness[currentLevel] = {
          business: 0,
          members: 0,
          activeMemberBusiness: 0
        };
      }

      // Calculate business for this member
      const memberBusiness = await this.calculatePersonalBusiness(node.user_id, startDate, endDate);
      
      // Add to level totals
      levelBusiness[currentLevel].business += memberBusiness;
      levelBusiness[currentLevel].members += 1;
      totalMembers += 1;
      totalTeamBusiness += memberBusiness;

      // Count as active if member has business
      if (memberBusiness > 0) {
        levelBusiness[currentLevel].activeMemberBusiness += memberBusiness;
      }

      // Process children recursively
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await processNode(child, currentLevel + 1);
        }
      }
    };

    // Process each root node
    for (const rootNode of teamStructure) {
      await processNode(rootNode);
    }

    return {
      levelBusiness,
      totalTeamBusiness,
      totalMembers
    };
  }

  static async calculateLegBusiness(userId, rewardSettings, startDate = null, endDate = null) {
    try {
      // Parse ratio from settings (e.g., "50:50" or "40:30:30")
      const ratioString = rewardSettings.ratio || "50:50";
      const ratios = ratioString.split(':').map(r => parseInt(r.trim()));
      
      // Get direct referrals (first level legs)
      const directReferrals = await this.getDirectReferrals(userId);
      
      const legBusiness = {};
      let totalLegBusiness = 0;

      // Initialize legs based on ratio
      for (let i = 0; i < ratios.length; i++) {
        legBusiness[`leg_${i + 1}`] = {
          ratio: ratios[i],
          business: 0,
          members: [],
          weightedBusiness: 0
        };
      }

      // Distribute team members to legs based on business volume
      const memberBusinessData = [];
      
      for (const referral of directReferrals) {
        const legTeamBusiness = await this.calculateLegTeamBusiness(referral.user_id, startDate, endDate);
        memberBusinessData.push({
          user_id: referral.user_id,
          business: legTeamBusiness
        });
      }

      // Sort by business volume (descending) for fair distribution
      memberBusinessData.sort((a, b) => b.business - a.business);

      // Distribute members to legs in round-robin fashion
      memberBusinessData.forEach((member, index) => {
        const legIndex = index % ratios.length;
        const legKey = `leg_${legIndex + 1}`;
        
        legBusiness[legKey].business += member.business;
        legBusiness[legKey].members.push(member.user_id);
        totalLegBusiness += member.business;
      });

      // Calculate weighted business based on ratios
      for (const legKey in legBusiness) {
        const leg = legBusiness[legKey];
        leg.weightedBusiness = (leg.business * leg.ratio) / 100;
      }

      return {
        legs: legBusiness,
        totalLegBusiness,
        ratios,
        distributionMode: rewardSettings.mode || 'auto'
      };
    } catch (error) {
      throw new Error(`Error calculating leg business: ${error.message}`);
    }
  }

  static async claimNow(userId, rewardSettings, thresholds, rewardProgramId, startDate = null, endDate = null) {
  try {
    // Step 1: Calculate Leg Business using your provided function
    const legBusinessData = await this.calculateLegBusiness(userId, rewardSettings, startDate, endDate);
    const totalBusiness = legBusinessData.totalLegBusiness;

    // Step 2: Find the highest eligible reward based on thresholds
    let eligibleThreshold = null;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalBusiness >= thresholds[i].target) {
        eligibleThreshold = thresholds[i];
        break;
      }
    }

    if (!eligibleThreshold) {
      return { success: false, message: "No eligible reward yet" };
    }

    // Step 3: Check if already achieved or claimed
    const checkSql = `
      SELECT * FROM user_rewards 
      WHERE user_id = ? AND reward_program_id = ? 
      ORDER BY achieved_at DESC LIMIT 1
    `;
    const existing = await database.query(checkSql, [userId, rewardProgramId]);

    if (
      existing.length > 0 &&
      existing[0].status === 'claimed' &&
      existing[0].required_target === eligibleThreshold.target
    ) {
      return { success: false, message: "Reward already claimed" };
    }

    // Step 4: Prepare reward data
    const achievementPercentage = Math.min((totalBusiness / eligibleThreshold.target) * 100, 100);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + (rewardSettings.expiry_days || 30));

    // Step 5: Insert / Update reward record
    const rewardSql = existing.length > 0
      ? `
        UPDATE user_rewards 
        SET current_progress = ?, 
            required_target = ?, 
            achievement_percentage = ?, 
            status = ?, 
            achieved_at = ?, 
            claimed_at = ?, 
            expires_at = ?, 
            reward_amount = ?, 
            updated_at = ?
        WHERE id = ?
      `
      : `
        INSERT INTO user_rewards 
        (user_id, reward_program_id, current_progress, required_target, achievement_percentage, status, achieved_at, claimed_at, expires_at, reward_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const rewardParams = existing.length > 0
      ? [
          totalBusiness,
          eligibleThreshold.target,
          achievementPercentage,
          'claimed',
          now,
          now,
          expiresAt,
          eligibleThreshold.reward,
          now,
          existing[0].id
        ]
      : [
          userId,
          rewardProgramId,
          totalBusiness,
          eligibleThreshold.target,
          achievementPercentage,
          'claimed',
          now,
          now,
          expiresAt,
          eligibleThreshold.reward,
          now,
          now
        ];

    await database.query(rewardSql, rewardParams);

    return {
      success: true,
      message: "Reward claimed successfully",
      data: {
        target: eligibleThreshold.target,
        reward: eligibleThreshold.reward,
        totalBusiness,
        legs: legBusinessData.legs
      }
    };
  } catch (error) {
    throw new Error(`Error claiming reward: ${error.message}`);
  }
}


  static async getDirectReferrals(userId) {
    try {
      const sql = `
        SELECT 
          user_id,
          level,
          path,
          direct_referrals,
          total_team_size,
          active_team_size,
          team_business
        FROM user_mlm_tree 
        WHERE parent_id = ?
        ORDER BY user_id
      `;
      
      const results = await database.query(sql, [userId]);
      return results;
    } catch (error) {
      throw new Error(`Error getting direct referrals: ${error.message}`);
    }
  }

  static async calculateLegTeamBusiness(legRootUserId, startDate = null, endDate = null) {
    try {
      // Get all team members under this leg root using path
      const sql = `
        SELECT user_id
        FROM user_mlm_tree 
        WHERE path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
        AND user_id != ?
      `;
      
      const teamMembers = await database.query(sql, [legRootUserId, legRootUserId]);
      
      let totalBusiness = 0;
      
      // Include the leg root's own business
      totalBusiness += await this.calculatePersonalBusiness(legRootUserId, startDate, endDate);
      
      // Calculate business for all team members under this leg
      for (const member of teamMembers) {
        const memberBusiness = await this.calculatePersonalBusiness(member.user_id, startDate, endDate);
        totalBusiness += memberBusiness;
      }
      
      return totalBusiness;
    } catch (error) {
      throw new Error(`Error calculating leg team business: ${error.message}`);
    }
  }

  static async calculatePersonalBusiness(userId, startDate = null, endDate = null) {
    try {
      let sql = `
        SELECT 
          SUM(invested_amount) as total_invested,
          SUM(current_value) as total_current_value,
          SUM(total_earned) as total_earned,
          COUNT(*) as investment_count
        FROM user_investments 
        WHERE user_id = ? AND status IN ('active', 'completed')
      `;
      
      const params = [userId];
      
      // Add date filters if provided
      if (startDate) {
        sql += ' AND created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND created_at <= ?';
        params.push(endDate);
      }
      
      const results = await database.query(sql, params);
      
      // Return total invested amount as business value (ensure it's a number)
      const totalInvested = results[0]?.total_invested || 0;
      return parseFloat(totalInvested) || 0;
    } catch (error) {
      throw new Error(`Error calculating personal business: ${error.message}`);
    }
  }

  static async getTeamMembers(userId) {
    try {
      const sql = `
        SELECT 
          user_id,
          level,
          path,
          direct_referrals,
          total_team_size,
          active_team_size,
          team_business
        FROM user_mlm_tree 
        WHERE path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
        AND user_id != ?
        ORDER BY level, user_id
      `;
      
      const results = await database.query(sql, [userId]);
      return results;
    } catch (error) {
      throw new Error(`Error getting team members: ${error.message}`);
    }
  }

  static async updateRewardProgress(userId, rewardProgramId, businessData) {
    try {
      // First, get or create the user reward record
      let userReward = await this.getUserReward(userId, rewardProgramId);
      
      if (!userReward) {
        // Create new reward record
        const UserRewards = require('./UserRewards');
        userReward = new UserRewards({
          user_id: userId,
          reward_program_id: rewardProgramId,
          current_progress: businessData.totalBusiness,
          status: 'in_progress'
        });
      } else {
        // Update existing record
        userReward.current_progress = businessData.totalBusiness;
      }
      
      // Calculate achievement percentage
      if (userReward.required_target > 0) {
        userReward.achievement_percentage = Math.min(
          (userReward.current_progress / userReward.required_target) * 100,
          100
        );
      }
      
      // Update status based on achievement
      if (userReward.achievement_percentage >= 100 && userReward.status === 'in_progress') {
        userReward.status = 'achieved';
        userReward.achieved_at = new Date();
      }
      
      // Save the updated reward
      if (userReward.id) {
        await userReward.update();
      } else {
        await userReward.save();
      }
      
      return userReward;
    } catch (error) {
      throw new Error(`Error updating reward progress: ${error.message}`);
    }
  }

  static async getUserReward(userId, rewardProgramId) {
    try {
      const sql = 'SELECT * FROM user_rewards WHERE user_id = ? AND reward_program_id = ?';
      const results = await database.query(sql, [userId, rewardProgramId]);
      
      if (results.length === 0) {
        return null;
      }
      
      const UserRewards = require('./UserRewards');
      return new UserRewards(results[0]);
    } catch (error) {
      throw new Error(`Error getting user reward: ${error.message}`);
    }
  }

  static async bulkCalculateRewards(userIds, rewardProgramId, startDate = null, endDate = null) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const businessData = await this.calculateTeamBusiness(userId, startDate, endDate);
          const userReward = await this.updateRewardProgress(userId, rewardProgramId, businessData);
          
          results.push({
            userId,
            success: true,
            businessData,
            userReward
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error in bulk reward calculation: ${error.message}`);
    }
  }

  static async getBusinessReport(userId, startDate = null, endDate = null) {
    try {
      const businessData = await this.calculateTeamBusiness(userId, startDate, endDate);
      
      // Get additional details
      const personalInvestments = await this.getPersonalInvestments(userId, startDate, endDate);
      const teamInvestments = await this.getTeamInvestments(userId, startDate, endDate);
      
      return {
        ...businessData,
        personalInvestments,
        teamInvestments,
        reportDate: new Date(),
        period: {
          startDate,
          endDate
        }
      };
    } catch (error) {
      throw new Error(`Error generating business report: ${error.message}`);
    }
  }

  static async getPersonalInvestments(userId, startDate = null, endDate = null) {
    try {
      let sql = `
        SELECT 
          id, plan_id, invested_amount, current_value, total_earned, 
          status, start_date, end_date, last_roi_date, created_at
        FROM user_investments 
        WHERE user_id = ?
      `;
      
      const params = [userId];
      
      if (startDate) {
        sql += ' AND created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND created_at <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const results = await database.query(sql, params);
      return results;
    } catch (error) {
      throw new Error(`Error getting personal investments: ${error.message}`);
    }
  }

  static async getTeamInvestments(userId, startDate = null, endDate = null) {
    try {
      let sql = `
        SELECT 
          ui.id, ui.user_id, ui.plan_id, ui.invested_amount, ui.current_value, 
          ui.total_earned, ui.status, ui.start_date, ui.end_date, ui.last_roi_date, ui.created_at,
          u.username, u.full_name,
          umt.level
        FROM user_investments ui
        JOIN users u ON ui.user_id = u.id
        JOIN user_mlm_tree umt ON ui.user_id = umt.user_id
        WHERE umt.path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
        AND ui.user_id != ?
      `;
      
      const params = [userId, userId];
      
      if (startDate) {
        sql += ' AND ui.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += ' AND ui.created_at <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY umt.level, ui.created_at DESC';
      
      const results = await database.query(sql, params);
      return results;
    } catch (error) {
      throw new Error(`Error getting team investments: ${error.message}`);
    }
  }

  static async updateMLMTreeBusiness(userId) {
    try {
      const businessData = await this.calculateTeamBusiness(userId);
      
      const sql = `
        UPDATE user_mlm_tree 
        SET 
          team_business = ?,
          active_team_size = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;
      
      const activeTeamSize = Object.values(businessData.teamLevels)
        .reduce((sum, level) => sum + (level.activeMemberBusiness > 0 ? level.members : 0), 0);
      
      await database.query(sql, [businessData.teamBusiness, activeTeamSize, userId]);
      
      return true;
    } catch (error) {
      throw new Error(`Error updating MLM tree business: ${error.message}`);
    }
  }

  // Additional helper method for testing with your data structure
  static async getTeamStructureForUser(userId) {
    try {
      const sql = `
        SELECT 
          umt.user_id,
          umt.parent_id,
          umt.level,
          umt.path,
          umt.direct_referrals,
          umt.total_team_size,
          umt.active_team_size,
          umt.team_business,
          u.username,
          u.full_name
        FROM user_mlm_tree umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.path LIKE CONCAT((SELECT path FROM user_mlm_tree WHERE user_id = ?), '%')
        ORDER BY umt.level, umt.user_id
      `;
      
      const results = await database.query(sql, [userId]);
      return results;
    } catch (error) {
      throw new Error(`Error getting team structure: ${error.message}`);
    }
  }

  // Method to calculate business based on your sample data structure
  static async calculateBusinessFromSampleData(userId) {
    try {
      // For testing with your sample data:
      // User 5 is the root (level 1, path '/5/')
      // User 6 is level 2 (path '/5/6/')
      // User 7 is level 3 (path '/5/6/7/')
      // User 8 is level 2 (path '/5/8/')
      
      const teamStructure = await this.getTeamStructureForUser(userId);
      console.log('Team Structure:', teamStructure);
      
      const businessData = await this.calculateTeamBusiness(userId);
      console.log('Business Data:', businessData);
      
      return businessData;
    } catch (error) {
      throw new Error(`Error calculating business from sample data: ${error.message}`);
    }
  }
}


module.exports = RewardBusinessCalculator;