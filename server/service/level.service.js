// // services/CommissionService.js
// const Database = require("../database");
// const Transaction = require("../models/Transaction");
// const LevelConfig = require("../models/LevelConfig");
// const SystemSettings = require("../models/SystemSettings");

// // setting key commission_level, values {"enabled": true, "max_levels": 30, "per_direct": 1, "all_open_after": 30}

// // Level Commission class
// class CommissionService {
//   constructor() {
//     this.levelConfig = new LevelConfig();
//     this.commissionSettings = null;
//   }

// async initializeSettings() {
//   try {
//     const settings = await SystemSettings.getValueByKey("commission_levels");
//     if (settings) {
//       // Parse the string to JSON if it's a string
//       this.commissionSettings = typeof settings === 'string'
//         ? JSON.parse(settings)
//         : settings;

//       // Validate settings structure
//       if (
//         !this.commissionSettings.enabled ||
//         !this.commissionSettings.max_levels ||
//         !this.commissionSettings.per_direct ||
//         !this.commissionSettings.all_open_after
//       ) {
//         throw new Error("Invalid commission settings structure");
//       }
//     } else {
//       throw new Error("Level processing settings not found");
//     }
//   } catch (error) {
//     // Handle JSON parsing errors specifically
//     if (error instanceof SyntaxError) {
//       console.error("Error parsing commission settings JSON:", error);
//       throw new Error("Invalid JSON format in commission settings");
//     }
//     console.error("Error initializing commission settings:", error);
//     throw error;
//   }
// }

//   async calculateCommissionForAllUsers() {
//     // Initialize settings first
//     await this.initializeSettings();

//     // Check if commission processing is enabled
//     if (!this.commissionSettings.enabled) {
//       return {
//         success: false,
//         message: "Commission processing is disabled",
//         processed_users: 0,
//         total_commission_distributed: 0,
//         transactions_created: 0,
//       };
//     }

//     const connection = await Database.beginTransaction();
//     try {
//       // 1. Fetch all necessary data
//       const users = await this.fetchAllUsers(connection);
//       const levelConfigs = await this.levelConfig.getAll(true); // Only active levels
//       const investments = await this.fetchActiveInvestments(connection);

//       // 2. Build referral tree structure
//       const userMap = this.buildUserMap(users);
//       const referralTree = this.buildReferralTree(users, userMap);

//       // 3. Calculate daily ROI for each user's investments
//       const userROIMap = this.calculateUserROI(investments);

//       // 4. Process commissions for each user
//       const results = await this.processAllCommissions(
//         referralTree,
//         levelConfigs,
//         userROIMap,
//         connection
//       );

//       await Database.commitTransaction(connection);

//       return {
//         success: true,
//         processed_users: results.processedUsers,
//         total_commission_distributed: results.totalCommissionDistributed,
//         transactions_created: results.transactionsCreated,
//       };
//     } catch (error) {
//       await Database.rollbackTransaction(connection);
//       throw new Error(`Commission calculation failed: ${error.message}`);
//     }
//   }

//   /**
//    * Fetch all users with their referral relationships
//    */
//   async fetchAllUsers(connection) {
//     const sql = `
//       SELECT
//         u.id,
//         u.username,
//         u.referral_code,
//         u.referrer_id,
//         u.status,
//         uw.main_balance as current_balance,
//         uw.total_earned,
//         uw.total_withdrawn,
//         (
//           SELECT COUNT(*)
//           FROM users ref
//           WHERE ref.referrer_id = u.id
//           AND ref.status = 'active'
//         ) as direct_referrals_count
//       FROM users u
//       LEFT JOIN user_wallets uw ON u.id = uw.user_id
//       WHERE u.status IN ('active', 'inactive')
//       ORDER BY u.id ASC
//     `;

//     const result = connection
//       ? await connection.execute(sql)
//       : await Database.query(sql);

//     return result[0] || result;
//   }

//   /**
//    * Fetch active investments with their daily ROI
//    */
//   async fetchActiveInvestments(connection) {
//     const sql = `
//       SELECT
//         ui.user_id,
//         ui.invested_amount,
//         ui.current_value,
//         ui.total_earned,
//         ui.last_roi_date,
//         ip.daily_roi_percentage,
//         ip.max_roi_amount,
//         DATEDIFF(CURDATE(), COALESCE(ui.last_roi_date, ui.start_date)) as days_since_last_roi
//       FROM user_investments ui
//       JOIN investment_plans ip ON ui.plan_id = ip.id
//       WHERE ui.status = 'active'
//       AND ui.end_date >= CURDATE()
//       AND (
//         ui.total_earned < ip.max_roi_amount
//         OR ip.max_roi_amount IS NULL
//       )
//     `;

//     const result = connection
//       ? await connection.execute(sql)
//       : await Database.query(sql);

//     return result[0] || result;
//   }

//   /**
//    * Build user map for quick lookup
//    */
//   buildUserMap(users) {
//     const userMap = new Map();
//     users.forEach((user) => {
//       user.referrals = [];
//       user.daily_roi = 0;
//       userMap.set(user.id, user);
//     });
//     return userMap;
//   }

//   /**
//    * Build referral tree structure
//    */
//   buildReferralTree(users, userMap) {
//     const rootUsers = [];

//     users.forEach((user) => {
//       if (user.referrer_id && userMap.has(user.referrer_id)) {
//         const parent = userMap.get(user.referrer_id);
//         parent.referrals.push(user);
//       } else {
//         rootUsers.push(user);
//       }
//     });

//     return rootUsers;
//   }

//   /**
//    * Calculate daily ROI for each user
//    */
//   calculateUserROI(investments) {
//     const userROIMap = new Map();

//     investments.forEach((investment) => {
//       const dailyROI =
//         investment.invested_amount * (investment.daily_roi_percentage / 100);
//       const maxEarning =
//         investment.max_roi_amount || investment.invested_amount * 3; // Default 3x if not set

//       // Check if user can still earn
//       const canEarn = investment.total_earned < maxEarning;

//       if (!userROIMap.has(investment.user_id)) {
//         userROIMap.set(investment.user_id, {
//           total_daily_roi: 0,
//           can_earn: false,
//           investments: [],
//         });
//       }

//       const userROI = userROIMap.get(investment.user_id);
//       if (canEarn) {
//         userROI.total_daily_roi += dailyROI;
//         userROI.can_earn = true;
//       }
//       userROI.investments.push(investment);
//     });

//     return userROIMap;
//   }

//   /**
//    * Process commissions for all users
//    */
//   async processAllCommissions(rootUsers, levelConfigs, userROIMap, connection) {
//     let processedUsers = 0;
//     let totalCommissionDistributed = 0;
//     let transactionsCreated = 0;

//     // Process each root user and their downline
//     for (const rootUser of rootUsers) {
//       const result = await this.processUserCommissions(
//         rootUser,
//         levelConfigs,
//         userROIMap,
//         connection
//       );

//       processedUsers += result.processedUsers;
//       totalCommissionDistributed += result.totalCommissionDistributed;
//       transactionsCreated += result.transactionsCreated;
//     }

//     return {
//       processedUsers,
//       totalCommissionDistributed,
//       transactionsCreated,
//     };
//   }

//   /**
//    * Process commissions for a user and their downline
//    */
//   async processUserCommissions(user, levelConfigs, userROIMap, connection) {
//     let processedUsers = 0;
//     let totalCommissionDistributed = 0;
//     let transactionsCreated = 0;

//     // Calculate commission for current user
//     if (user.status === "active") {
//       const commission = await this.calculateUserCommission(
//         user,
//         levelConfigs,
//         userROIMap,
//         connection
//       );

//       if (commission > 0) {
//         await this.distributeCommission(user, commission, connection);
//         totalCommissionDistributed += commission;
//         transactionsCreated++;
//       }

//       processedUsers++;
//     }

//     // Recursively process referrals
//     for (const referral of user.referrals) {
//       const result = await this.processUserCommissions(
//         referral,
//         levelConfigs,
//         userROIMap,
//         connection
//       );

//       processedUsers += result.processedUsers;
//       totalCommissionDistributed += result.totalCommissionDistributed;
//       transactionsCreated += result.transactionsCreated;
//     }

//     return {
//       processedUsers,
//       totalCommissionDistributed,
//       transactionsCreated,
//     };
//   }

//   /**
//    * Calculate commission for a specific user
//    */
//   async calculateUserCommission(user, levelConfigs, userROIMap, connection) {
//     if (user.status !== "active") {
//       return 0;
//     }

//     let totalCommission = 0;
//     let commissionBreakdown = [];

//     // Determine maximum level based on settings and direct referrals
//     const maxLevel = this.getMaxLevelForUser(user.direct_referrals_count);

//     // Calculate commission from each level
//     const queue = [{ user: user, level: 0 }];
//     const visited = new Set();

//     while (queue.length > 0) {
//       const { user: currentUser, level } = queue.shift();

//       if (visited.has(currentUser.id) || level > maxLevel) {
//         continue;
//       }

//       visited.add(currentUser.id);

//       // Process referrals at next level
//       for (const referral of currentUser.referrals) {
//         if (referral.status === "active" && level + 1 <= maxLevel) {
//           const referralROI = userROIMap.get(referral.id);

//           if (
//             referralROI &&
//             referralROI.can_earn &&
//             referralROI.total_daily_roi > 0
//           ) {
//             const levelConfig = levelConfigs.find(
//               (lc) => lc.level_number === level + 1
//             );

//             if (levelConfig) {
//               const commission =
//                 referralROI.total_daily_roi *
//                 (levelConfig.commission_percentage / 100);
//               totalCommission += commission;

//               // Add to commission breakdown
//               commissionBreakdown.push({
//                 referral_user_id: referral.id,
//                 referral_username: referral.username,
//                 level: level + 1,
//                 commission_amount: commission,
//                 original_amount: referralROI.total_daily_roi,
//                 commission_percentage: levelConfig.commission_percentage,
//                 timestamp: new Date().toISOString(),
//               });
//             }
//           }

//           queue.push({ user: referral, level: level + 1 });
//         }
//       }
//     }

//     // Store commission breakdown for transaction details
//     user.commissionBreakdown = commissionBreakdown;

//     return totalCommission;
//   }

//   /**
//    * Get maximum level for user based on settings and direct referrals count
//    */
//   getMaxLevelForUser(directReferralsCount) {
//     const { max_levels, per_direct, all_open_after } = this.commissionSettings;

//     // If user has enough direct referrals to open all levels
//     if (directReferralsCount >= all_open_after) {
//       return Math.min(max_levels, 30); // Cap at 30 or max_levels, whichever is lower
//     }

//     // Calculate levels based on per_direct setting
//     const calculatedLevels = directReferralsCount * per_direct;

//     // Return minimum of calculated levels and max_levels setting
//     return Math.min(calculatedLevels, max_levels);
//   }

//   /**
//    * Distribute commission to user via transaction
//    */
//   async distributeCommission(user, commission, connection) {
//     const transaction = new Transaction({
//       user_id: user.id,
//       transaction_type: "level_commission",
//       amount: commission,
//       fee_amount: 0,
//       net_amount: commission,
//       currency: "USD",
//       status: "completed",
//       source_type: "internal",
//       source_details: JSON.stringify({
//         commission_type: "daily_mlm_commission",
//         calculation_date: new Date().toISOString().split("T")[0],
//         user_info: {
//           user_id: user.id,
//           username: user.username,
//           direct_referrals_count: user.direct_referrals_count,
//           max_level_eligible: this.getMaxLevelForUser(
//             user.direct_referrals_count
//           ),
//         },
//         commission_breakdown: user.commissionBreakdown || [],
//         summary: {
//           total_commission: commission,
//           total_levels_processed: user.commissionBreakdown
//             ? user.commissionBreakdown.length
//             : 0,
//           levels_earned_from: user.commissionBreakdown
//             ? [...new Set(user.commissionBreakdown.map((b) => b.level))].sort(
//                 (a, b) => a - b
//               )
//             : [],
//         },
//       }),
//       processed_by: null, // System generated
//       related_user_id: 1,
//       processed_at: new Date(),
//     });

//     await transaction.create(connection);
//     return transaction;
//   }

//   /**
//    * Get commission settings
//    */
//   getCommissionSettings() {
//     return this.commissionSettings;
//   }

//   /**
//    * Get user level eligibility info
//    */
//   getUserLevelInfo(directReferralsCount) {
//     if (!this.commissionSettings) {
//       return { maxLevel: 0, allLevelsOpen: false };
//     }

//     const { max_levels, per_direct, all_open_after } = this.commissionSettings;
//     const maxLevel = this.getMaxLevelForUser(directReferralsCount);
//     const allLevelsOpen = directReferralsCount >= all_open_after;

//     return {
//       maxLevel,
//       allLevelsOpen,
//       directReferralsCount,
//       levelsFromDirects: directReferralsCount * per_direct,
//       settings: {
//         max_levels,
//         per_direct,
//         all_open_after,
//       },
//     };
//   }

//   /**
//    * Get referral tree for a specific user
//    */
//   async getReferralTree(referralCode, depth = 1) {
//     try {
//       const sql = `
//         SELECT
//           u.id, u.username, u.referral_code, u.status, u.created_at,
//           uw.main_balance, uw.total_earned,
//           COUNT(ref.id) as direct_referrals_count
//         FROM users u
//         LEFT JOIN user_wallets uw ON u.id = uw.user_id
//         LEFT JOIN users ref ON ref.referrer_id = u.id AND ref.status = 'active'
//         WHERE u.referrer_id = (
//           SELECT id FROM users WHERE referral_code = ?
//         )
//         GROUP BY u.id
//         ORDER BY u.created_at DESC
//       `;

//       const [rows] = await Database.query(sql, [referralCode]);

//       if (depth > 1) {
//         // Recursively fetch deeper levels
//         for (const user of rows) {
//           user.referrals = await this.getReferralTree(
//             user.referral_code,
//             depth - 1
//           );
//         }
//       }

//       return rows;
//     } catch (error) {
//       throw new Error(`Error fetching referral tree: ${error.message}`);
//     }
//   }

//   /**
//    * Get full referral tree (all levels)
//    */
//   async getFullReferralTree(referralCode) {
//     // Initialize settings if not already done
//     if (!this.commissionSettings) {
//       await this.initializeSettings();
//     }

//     return await this.getReferralTree(
//       referralCode,
//       this.commissionSettings.max_levels
//     );
//   }
// }

// module.exports = CommissionService;

// services/CommissionService.js
const Database = require("../database");
const Transaction = require("../models/Transaction");
const LevelConfig = require("../models/LevelConfig");
const SystemSettings = require("../models/SystemSettings");

// setting key commission_level, values {"enabled": true, "max_levels": 30, "per_direct": 1, "all_open_after": 30}

// Level Commission class
class CommissionService {
  constructor() {
    this.levelConfig = new LevelConfig();
    this.commissionSettings = null;
  }

  async initializeSettings() {
    try {
      const settings = await SystemSettings.getValueByKey("commission_levels");
      if (settings) {
        // Parse the string to JSON if it's a string
        this.commissionSettings =
          typeof settings === "string" ? JSON.parse(settings) : settings;

        // Validate settings structure
        if (
          !this.commissionSettings.enabled ||
          !this.commissionSettings.max_levels ||
          !this.commissionSettings.per_direct ||
          !this.commissionSettings.all_open_after
        ) {
          throw new Error("Invalid commission settings structure");
        }
      } else {
        throw new Error("Level processing settings not found");
      }
    } catch (error) {
      // Handle JSON parsing errors specifically
      if (error instanceof SyntaxError) {
        console.error("Error parsing commission settings JSON:", error);
        throw new Error("Invalid JSON format in commission settings");
      }
      console.error("Error initializing commission settings:", error);
      throw error;
    }
  }

  async calculateCommissionForAllUsers() {
    // Initialize settings first
    await this.initializeSettings();

    // Check if commission processing is enabled
    if (!this.commissionSettings.enabled) {
      return {
        success: false,
        message: "Commission processing is disabled",
        processed_users: 0,
        total_commission_distributed: 0,
        transactions_created: 0,
      };
    }

    const connection = await Database.beginTransaction();
    try {
      // 1. Fetch all necessary data
      const users = await this.fetchAllUsers(connection);
      const levelConfigs = await this.levelConfig.getAll(true); // Only active levels
      const investments = await this.fetchActiveInvestments(connection);

      // 2. Build referral tree structure
      const userMap = this.buildUserMap(users);
      const referralTree = this.buildReferralTree(users, userMap);

      // 3. Calculate daily ROI for each user's investments
      const userROIMap = this.calculateUserROI(investments);

      // 4. Process commissions for each user
      const results = await this.processAllCommissions(
        referralTree,
        levelConfigs,
        userROIMap,
        connection
      );

      await Database.commitTransaction(connection);

      return {
        success: true,
        processed_users: results.processedUsers,
        total_commission_distributed: results.totalCommissionDistributed,
        transactions_created: results.transactionsCreated,
      };
    } catch (error) {
      await Database.rollbackTransaction(connection);
      throw new Error(`Commission calculation failed: ${error.message}`);
    }
  }

  /**
   * Fetch all users with their referral relationships and email
   */
  async fetchAllUsers(connection) {
    const sql = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        u.referral_code, 
        u.referrer_id,
        u.status,
        uw.main_balance as current_balance,
        uw.total_earned,
        uw.total_withdrawn,
        (
          SELECT COUNT(*) 
          FROM users ref 
          WHERE ref.referrer_id = u.id 
          AND ref.status = 'active'
        ) as direct_referrals_count
      FROM users u
      LEFT JOIN user_wallets uw ON u.id = uw.user_id
      WHERE u.status IN ('active', 'inactive')
      ORDER BY u.id ASC
    `;

    const result = connection
      ? await connection.execute(sql)
      : await Database.query(sql);

    return result[0] || result;
  }

  /**
   * Fetch active investments with their daily ROI
   */
  async fetchActiveInvestments(connection) {
    const sql = `
      SELECT 
        ui.user_id,
        ui.invested_amount,
        ui.current_value,
        ui.total_earned,
        ui.last_roi_date,
        ip.daily_roi_percentage,
        ip.max_roi_amount,
        DATEDIFF(CURDATE(), COALESCE(ui.last_roi_date, ui.start_date)) as days_since_last_roi
      FROM user_investments ui
      JOIN investment_plans ip ON ui.plan_id = ip.id
      WHERE ui.status = 'active'
      AND ui.end_date >= CURDATE()
      AND (
        ui.total_earned < ip.max_roi_amount 
        OR ip.max_roi_amount IS NULL
      )
    `;

    const result = connection
      ? await connection.execute(sql)
      : await Database.query(sql);

    return result[0] || result;
  }

  /**
   * Build user map for quick lookup
   */
  buildUserMap(users) {
    const userMap = new Map();
    users.forEach((user) => {
      user.referrals = [];
      user.daily_roi = 0;
      userMap.set(user.id, user);
    });
    return userMap;
  }

  /**
   * Build referral tree structure
   */
  buildReferralTree(users, userMap) {
    const rootUsers = [];

    users.forEach((user) => {
      if (user.referrer_id && userMap.has(user.referrer_id)) {
        const parent = userMap.get(user.referrer_id);
        parent.referrals.push(user);
      } else {
        rootUsers.push(user);
      }
    });

    return rootUsers;
  }

  /**
   * Calculate daily ROI for each user
   */
  calculateUserROI(investments) {
    const userROIMap = new Map();

    investments.forEach((investment) => {
      const dailyROI =
        investment.invested_amount * (investment.daily_roi_percentage / 100);
      const maxEarning =
        investment.max_roi_amount || investment.invested_amount * 3; // Default 3x if not set

      // Check if user can still earn
      const canEarn = investment.total_earned < maxEarning;

      if (!userROIMap.has(investment.user_id)) {
        userROIMap.set(investment.user_id, {
          total_daily_roi: 0,
          can_earn: false,
          investments: [],
        });
      }

      const userROI = userROIMap.get(investment.user_id);
      if (canEarn) {
        userROI.total_daily_roi += dailyROI;
        userROI.can_earn = true;
      }
      userROI.investments.push(investment);
    });

    return userROIMap;
  }

  /**
   * Process commissions for all users
   */
  async processAllCommissions(rootUsers, levelConfigs, userROIMap, connection) {
    let processedUsers = 0;
    let totalCommissionDistributed = 0;
    let transactionsCreated = 0;

    // Process each root user and their downline
    for (const rootUser of rootUsers) {
      const result = await this.processUserCommissions(
        rootUser,
        levelConfigs,
        userROIMap,
        connection
      );

      processedUsers += result.processedUsers;
      totalCommissionDistributed += result.totalCommissionDistributed;
      transactionsCreated += result.transactionsCreated;
    }

    return {
      processedUsers,
      totalCommissionDistributed,
      transactionsCreated,
    };
  }

  /**
   * Process commissions for a user and their downline
   */
  async processUserCommissions(user, levelConfigs, userROIMap, connection) {
    let processedUsers = 0;
    let totalCommissionDistributed = 0;
    let transactionsCreated = 0;

    // Calculate commission for current user
    if (user.status === "active") {
      const commission = await this.calculateUserCommission(
        user,
        levelConfigs,
        userROIMap,
        connection
      );

      if (commission > 0) {
        await this.distributeCommission(user, commission, connection);
        totalCommissionDistributed += commission;
        transactionsCreated++;
      }

      processedUsers++;
    }

    // Recursively process referrals
    for (const referral of user.referrals) {
      const result = await this.processUserCommissions(
        referral,
        levelConfigs,
        userROIMap,
        connection
      );

      processedUsers += result.processedUsers;
      totalCommissionDistributed += result.totalCommissionDistributed;
      transactionsCreated += result.transactionsCreated;
    }

    return {
      processedUsers,
      totalCommissionDistributed,
      transactionsCreated,
    };
  }

  /**
   * Calculate commission for a specific user - FIXED LOGIC
   */
  async calculateUserCommission(user, levelConfigs, userROIMap, connection) {
    if (user.status !== "active") {
      return 0;
    }

    // Get user's own ROI
    const userROI = userROIMap.get(user.id);
    if (!userROI || !userROI.can_earn || userROI.total_daily_roi <= 0) {
      return 0; // User must have their own ROI to earn commissions
    }

    let totalCommission = 0;
    let commissionBreakdown = [];

    // Determine maximum level based on settings and direct referrals
    const maxLevel = this.getMaxLevelForUser(user.direct_referrals_count);

    if (maxLevel <= 0) {
      return 0; // No levels unlocked
    }

    // Get all users in the downline up to maxLevel
    const downlineUsers = this.getDownlineUsers(user, maxLevel);

    // Calculate commission for each level where user has referrals
    for (let level = 1; level <= maxLevel; level++) {
      const usersAtLevel = downlineUsers.filter(
        (u) => u.level === level && u.user.status === "active"
      );

      if (usersAtLevel.length > 0) {
        const levelConfig = levelConfigs.find(
          (lc) => lc.level_number === level
        );

        if (levelConfig) {
          // Commission = percentage of USER'S OWN ROI (not referral's ROI)
          const levelCommission =
            userROI.total_daily_roi * (levelConfig.commission_percentage / 100);
          totalCommission += levelCommission;

          // Add details for each user at this level for tracking
          usersAtLevel.forEach((referralData) => {
            const referral = referralData.user;
            const referralROI = userROIMap.get(referral.id);

            commissionBreakdown.push({
              referral_user_id: referral.id,
              referral_username: referral.username,
              referral_email: referral.email,
              level: level,
              commission_amount: levelCommission / usersAtLevel.length, // Divide equally if multiple users at same level
              sponsor_roi: userROI.total_daily_roi,
              commission_percentage: levelConfig.commission_percentage,
              referral_roi: referralROI ? referralROI.total_daily_roi : 0,
              timestamp: new Date().toISOString(),
            });
          });
        }
      }
    }

    // Store commission breakdown for transaction details
    user.commissionBreakdown = commissionBreakdown;

    return totalCommission;
  }

  /**
   * Get all users in downline up to specified level with proper depth restriction
   */
  getDownlineUsers(user, maxLevel) {
    const downlineUsers = [];

    // Use BFS to get users at each level
    const queue = user.referrals.map((referral) => ({
      user: referral,
      level: 1,
    }));
    const visited = new Set();

    while (queue.length > 0) {
      const { user: currentUser, level } = queue.shift();

      if (level > maxLevel || visited.has(currentUser.id)) {
        continue;
      }

      visited.add(currentUser.id);
      downlineUsers.push({ user: currentUser, level });

      // Add next level referrals to queue if within depth limit
      if (level < maxLevel) {
        currentUser.referrals.forEach((referral) => {
          if (!visited.has(referral.id)) {
            queue.push({ user: referral, level: level + 1 });
          }
        });
      }
    }

    return downlineUsers;
  }

  /**
   * Get maximum level - FIXED: per_direct means levels per direct referral
   */
  getMaxLevelForUser(directReferralsCount) {
    const { max_levels, per_direct, all_open_after } = this.commissionSettings;

    // If user has enough direct referrals to open all levels
    if (directReferralsCount >= all_open_after) {
      return Math.min(max_levels, 30); // Cap at 30 or max_levels, whichever is lower
    }

    // FIXED: Each direct referral opens 'per_direct' levels deep
    // So if per_direct = 1, then 1 direct = 1 level, 2 directs = 2 levels, etc.
    const calculatedLevels = directReferralsCount * per_direct;

    // Return minimum of calculated levels and max_levels setting
    return Math.min(calculatedLevels, max_levels);
  }

  /**
   * Distribute commission to user via transaction
   */
  async distributeCommission(user, commission, connection) {
    const userROI = this.userROIMap?.get(user.id) || { total_daily_roi: 0 };

    const transaction = new Transaction({
      user_id: user.id,
      transaction_type: "level_commission",
      amount: commission,
      fee_amount: 0,
      net_amount: commission,
      currency: "USD",
      status: "completed",
      source_type: "internal",
      source_details: JSON.stringify({
        commission_type: "daily_mlm_commission",
        calculation_date: new Date().toISOString().split("T")[0],
        user_info: {
          user_id: user.id,
          username: user.username,
          email: user.email,
          direct_referrals_count: user.direct_referrals_count,
          max_level_eligible: this.getMaxLevelForUser(
            user.direct_referrals_count
          ),
          own_daily_roi: userROI.total_daily_roi,
        },
        commission_breakdown: user.commissionBreakdown || [],
        summary: {
          total_commission: commission,
          total_referrals_in_breakdown: user.commissionBreakdown
            ? user.commissionBreakdown.length
            : 0,
          levels_earned_from: user.commissionBreakdown
            ? [...new Set(user.commissionBreakdown.map((b) => b.level))].sort(
                (a, b) => a - b
              )
            : [],
          commission_source: "percentage_of_own_roi",
        },
      }),
      processed_by: null, // System generated
      related_user_id: 1,
      processed_at: new Date(),
    });

    await transaction.create(connection);
    return transaction;
  }

  /**
   * Get commission settings
   */
  getCommissionSettings() {
    return this.commissionSettings;
  }

  /**
   * Get user level eligibility info
   */
  getUserLevelInfo(directReferralsCount) {
    if (!this.commissionSettings) {
      return { maxLevel: 0, allLevelsOpen: false };
    }

    const { max_levels, per_direct, all_open_after } = this.commissionSettings;
    const maxLevel = this.getMaxLevelForUser(directReferralsCount);
    const allLevelsOpen = directReferralsCount >= all_open_after;

    return {
      maxLevel,
      allLevelsOpen,
      directReferralsCount,
      levelsFromDirects: directReferralsCount * per_direct,
      settings: {
        max_levels,
        per_direct,
        all_open_after,
      },
    };
  }

  /**
   * Get referral tree for a specific user
   */
  async getReferralTree(referralCode, depth = 1) {
    try {
      const sql = `
        SELECT 
          u.id, u.username, u.email, u.referral_code, u.status, u.created_at,
          uw.main_balance, uw.total_earned,
          COUNT(ref.id) as direct_referrals_count
        FROM users u
        LEFT JOIN user_wallets uw ON u.id = uw.user_id
        LEFT JOIN users ref ON ref.referrer_id = u.id AND ref.status = 'active'
        WHERE u.referrer_id = (
          SELECT id FROM users WHERE referral_code = ?
        )
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `;

      const [rows] = await Database.query(sql, [referralCode]);

      if (depth > 1) {
        // Recursively fetch deeper levels
        for (const user of rows) {
          user.referrals = await this.getReferralTree(
            user.referral_code,
            depth - 1
          );
        }
      }

      return rows;
    } catch (error) {
      throw new Error(`Error fetching referral tree: ${error.message}`);
    }
  }

  /**
   * Get full referral tree (all levels)
   */
  async getFullReferralTree(referralCode) {
    // Initialize settings if not already done
    if (!this.commissionSettings) {
      await this.initializeSettings();
    }

    return await this.getReferralTree(
      referralCode,
      this.commissionSettings.max_levels
    );
  }

  /**
   * Get detailed commission preview for a user
   */
  async getCommissionPreview(userId) {
    await this.initializeSettings();

    const connection = await Database.getConnection();
    try {
      const users = await this.fetchAllUsers(connection);
      const levelConfigs = await this.levelConfig.getAll(true);
      const investments = await this.fetchActiveInvestments(connection);

      const userMap = this.buildUserMap(users);
      this.buildReferralTree(users, userMap);
      const userROIMap = this.calculateUserROI(investments);

      const user = userMap.get(userId);
      if (!user) {
        throw new Error("User not found");
      }

      this.userROIMap = userROIMap; // Store for use in distributeCommission

      const commission = await this.calculateUserCommission(
        user,
        levelConfigs,
        userROIMap,
        connection
      );

      return {
        user_info: {
          id: user.id,
          username: user.username,
          email: user.email,
          direct_referrals_count: user.direct_referrals_count,
          own_daily_roi: userROIMap.get(userId)?.total_daily_roi || 0,
          max_level_eligible: this.getMaxLevelForUser(
            user.direct_referrals_count
          ),
        },
        total_commission: commission,
        commission_breakdown: user.commissionBreakdown || [],
        settings: this.commissionSettings,
      };
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = CommissionService;
