// const Transaction = require("../models/Transaction");
// const SystemSettings = require("../models/SystemSettings");

// class ROI {
//   constructor(connection) {
//     this.connection = connection;
//     this.roiSettings = null;
//     this.boosterSettings = null;
//   }
//   /**
//    * Initialize ROI settings from system_setting table
//    */
//   async initializeSettings() {
//     try {
//       const settings = await SystemSettings.getValueByKey("roi_processing");
//       if (settings) {
//         // Parse to JSON if string, otherwise keep as-is
//         this.roiSettings =
//           typeof settings === "string" ? JSON.parse(settings) : settings;
//       } else {
//         throw new Error("ROI processing settings not found or inactive");
//       }

//       // Initialize booster settings if enabled
//       if (this.roiSettings.is_booster) {
//         const boosterSettings = await SystemSettings.getValueByKey(
//           "roi_booster"
//         );
//         if (boosterSettings && boosterSettings.length > 0) {
//           const settingValue = boosterSettings[0].setting_value;
//           // Parse to JSON if string, otherwise keep as-is
//           this.boosterSettings =
//             typeof settingValue === "string"
//               ? JSON.parse(settingValue)
//               : settingValue;
//         } else {
//           console.warn("ROI booster is enabled but booster settings not found");
//           this.boosterSettings = null;
//         }
//       }
//     } catch (error) {
//       console.error("Error initializing ROI settings:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get active investments eligible for ROI processing
//    */

//   async getEligibleInvestments() {
//     try {
//       const query = `
//         SELECT
//           ui.*,
//           ip.daily_roi_percentage,
//           ip.name as plan_name,
//           ip.duration_days,
//           ip.max_roi_amount
//         FROM user_investments ui
//         JOIN investment_plans ip ON ui.plan_id = ip.id
//         WHERE ui.status = 'active'
//         AND ui.end_date >= CURDATE()
//         AND (ui.last_roi_date IS NULL OR ui.last_roi_date < CURDATE())
//         AND ip.is_active = 1
//         ORDER BY ui.created_at ASC
//       `;

//       const [investments] = await this.connection.execute(query);
//       return investments;
//     } catch (error) {
//       console.error("Error fetching eligible investments:", error);
//       throw error;
//     }
//   }

//   async getUserInvestment(investmentId) {
//     try {
//       const query = `
//       SELECT
//         id, user_id, plan_id, invested_amount, current_value,
//         total_earned, status, start_date, end_date, last_roi_date,
//         created_at, updated_at
//       FROM user_investment
//       WHERE id = ? AND status = 'active'
//     `;

//       const [result] = await this.connection.execute(query, [investmentId]);
//       return result[0] || null;
//     } catch (error) {
//       console.error(`Error getting investment ${investmentId}:`, error);
//       return null;
//     }
//   }
//   /**
//    * Get user's first investment date (activation date)
//    */
//   async getUserActivationDate(userId) {
//     try {
//       const query = `
//       SELECT MIN(start_date) as activation_date
//       FROM user_investment
//       WHERE user_id = ? AND status = 'active'
//     `;

//       const [result] = await this.connection.execute(query, [userId]);
//       return result[0]?.activation_date || null;
//     } catch (error) {
//       console.error(`Error getting activation date for user ${userId}:`, error);
//       return null;
//     }
//   }
//   /**
//    * Get user's direct referrals count within 7 days of activation
//    */
//   async getUserDirectCountWithinActivation(userId) {
//     try {
//       // First get the user's activation date
//       const activationDate = await this.getUserActivationDate(userId);

//       if (!activationDate) {
//         return 0; // User not activated yet
//       }

//       const query = `
//       SELECT COUNT(*) as direct_count
//       FROM users
//       WHERE referred_by = ?
//         AND status = 'active'
//         AND created_at >= ?
//         AND created_at <= DATE_ADD(?, INTERVAL 7 DAY)
//     `;

//       const [result] = await this.connection.execute(query, [
//         userId,
//         activationDate,
//         activationDate,
//       ]);

//       return result[0].direct_count || 0;
//     } catch (error) {
//       console.error(
//         `Error getting direct count within activation for user ${userId}:`,
//         error
//       );
//       return 0;
//     }
//   }
//   /**
//    * Check if user is newly activated (has investments)
//    */
//   async isUserNewlyActivated(userId) {
//     try {
//       const activationDate = await this.getUserActivationDate(userId);
//       return activationDate !== null;
//     } catch (error) {
//       console.error(`Error checking user activation status ${userId}:`, error);
//       return false;
//     }
//   }
//   /**
//    * Calculate boosted ROI percentage based on direct referrals within 7 days of activation
//    * Only applies to newly activated users (users who have made investments)
//    */
//   async calculateBoostedROI(userId, baseROIPercentage) {
//     if (!this.roiSettings.is_booster || !this.boosterSettings) {
//       return baseROIPercentage;
//     }

//     // Check if user is newly activated (has investments)
//     const isActivated = await this.isUserNewlyActivated(userId);

//     if (!isActivated) {
//       console.log(
//         `User ${userId} not activated yet, using base ROI: ${baseROIPercentage}%`
//       );
//       return baseROIPercentage;
//     }

//     // Get direct referrals count within 7 days of activation
//     const directCount = await this.getUserDirectCountWithinActivation(userId);

//     let boostPercentage = 0;

//     // Apply boost based on direct referrals within 7 days
//     if (directCount >= 5) {
//       boostPercentage = 2; // 2% boost for 5+ directs
//     } else if (directCount >= 2) {
//       boostPercentage = 1; // 1% boost for 2+ directs
//     }

//     if (boostPercentage > 0) {
//       const boostedROI = baseROIPercentage + boostPercentage;
//       console.log(
//         `User ${userId} qualified for activation ROI boost: ${baseROIPercentage}% -> ${boostedROI}% (${directCount} directs within 7 days of activation)`
//       );
//       return boostedROI;
//     }

//     console.log(
//       `User ${userId} using base ROI: ${baseROIPercentage}% (${directCount} directs within 7 days, insufficient for boost)`
//     );
//     return baseROIPercentage;
//   }

//   /**
//    * Calculate daily ROI amount for an investment
//    */
//   async calculateDailyROI(investment) {
//     // Get potentially boosted ROI percentage
//     const effectiveROIPercentage = await this.calculateBoostedROI(
//       investment.user_id,
//       investment.daily_roi_percentage
//     );

//     const dailyROI =
//       (investment.invested_amount * effectiveROIPercentage) / 100;

//     // Check if adding this ROI would exceed the maximum limit (2x invested amount)
//     const maxAllowed =
//       investment.invested_amount * (this.roiSettings?.max_limit || 2);
//     const newTotalEarned = investment.total_earned + dailyROI;

//     if (newTotalEarned > maxAllowed) {
//       // Return the remaining amount to reach the limit
//       return Math.max(0, maxAllowed - investment.total_earned);
//     }

//     return dailyROI;
//   }

//   /**
//    * Check if investment should be marked as completed
//    */
//   shouldCompleteInvestment(investment, newTotalEarned) {
//     const maxAllowed =
//       investment.invested_amount * (this.roiSettings?.max_limit || 2);
//     return newTotalEarned >= maxAllowed;
//   }

//   /**
//    * Process ROI for a single investment
//    */
//   async processInvestmentROI(investment) {
//     try {
//       await this.connection.beginTransaction();

//       const dailyROIAmount = await this.calculateDailyROI(investment);

//       if (dailyROIAmount <= 0) {
//         console.log(
//           `Investment ${investment.id} has reached maximum ROI limit`
//         );
//         await this.connection.rollback();
//         return { success: false, message: "ROI limit reached" };
//       }

//       const newTotalEarned =
//         parseFloat(investment.total_earned) + parseFloat(dailyROIAmount);
//       const newCurrentValue =
//         parseFloat(investment.current_value) + parseFloat(dailyROIAmount);
//       const shouldComplete = this.shouldCompleteInvestment(
//         investment,
//         newTotalEarned
//       );

//       // Update investment record
//       const updateInvestmentQuery = `
//         UPDATE user_investments
//         SET
//           current_value = ?,
//           total_earned = ?,
//           last_roi_date = CURDATE(),
//           status = ?,
//           updated_at = NOW()
//         WHERE id = ?
//       `;

//       await this.connection.execute(updateInvestmentQuery, [
//         newCurrentValue,
//         newTotalEarned,
//         shouldComplete ? "completed" : "active",
//         investment.id,
//       ]);

//       // Create ROI transaction
//       const transactionData = {
//         user_id: investment.user_id,
//         transaction_type: "roi_earning",
//         amount: dailyROIAmount,
//         fee_amount: 0,
//         net_amount: dailyROIAmount,
//         currency: "USD",
//         status: "completed",
//         related_user_id: null,
//         related_investment_id: investment.id,
//         source_type: "internal",
//         source_details: JSON.stringify({
//           investment_id: investment.id,
//           plan_name: investment.plan_name,
//           invested_amount: investment.invested_amount,
//           daily_roi_percentage: investment.daily_roi_percentage,
//           processing_date: new Date().toISOString(),
//           boost_applied: this.roiSettings.is_booster,
//         }),
//         processed_by: investment.user_id,
//         processed_at: new Date(),
//         admin_notes: `Daily ROI for investment #${investment.id}`,
//       };

//       const transaction = new Transaction(transactionData);
//       await transaction.create(this.connection);

//       // Update user wallet - add ROI to roi_balance
//       //   await this.updateUserWallet(investment.user_id, dailyROIAmount);

//       await this.connection.commit();

//       return {
//         success: true,
//         investment_id: investment.id,
//         user_id: investment.user_id,
//         roi_amount: dailyROIAmount,
//         total_earned: newTotalEarned,
//         completed: shouldComplete,
//         transaction_id: transaction.id,
//       };
//     } catch (error) {
//       await this.connection.rollback();
//       console.error(
//         `Error processing ROI for investment ${investment.id}:`,
//         error
//       );
//       throw error;
//     }
//   }

//   /**
//    * Process ROI for all eligible investments (System Type)
//    */
//   async processAllROI() {
//     try {
//       // Initialize settings
//       await this.initializeSettings();

//       if (!this.roiSettings || !this.roiSettings.enabled) {
//         console.log("ROI processing is disabled");
//         return { success: false, message: "ROI processing is disabled" };
//       }

//       // Check if this is system type processing
//       if (this.roiSettings.type !== "system") {
//         console.log(
//           "ROI processing type is not 'system', use processUserROI for manual processing"
//         );
//         return {
//           success: false,
//           message: "Use processUserROI for manual processing",
//         };
//       }
//       const eligibleInvestments = await this.getEligibleInvestments();

//       if (eligibleInvestments.length === 0) {
//         console.log("No eligible investments found for ROI processing");
//         return {
//           success: true,
//           message: "No eligible investments",
//           processed: 0,
//         };
//       }

//       const results = {
//         total_processed: 0,
//         successful: 0,
//         failed: 0,
//         total_roi_amount: 0,
//         details: [],
//       };

//       console.log(
//         `Processing ROI for ${eligibleInvestments.length} investments`
//       );

//       for (const investment of eligibleInvestments) {
//         try {
//           const result = await this.processInvestmentROI(investment);

//           if (result.success) {
//             results.successful++;
//             results.total_roi_amount += result.roi_amount;
//             results.details.push(result);
//             console.log(
//               `✓ Processed ROI for investment ${investment.id}: ${result.roi_amount}`
//             );
//           } else {
//             results.failed++;
//             console.log(
//               `⚠ Skipped investment ${investment.id}: ${result.message}`
//             );
//           }
//         } catch (error) {
//           results.failed++;
//           console.error(
//             `✗ Failed to process investment ${investment.id}:`,
//             error.message
//           );
//         }

//         results.total_processed++;
//       }

//       console.log(
//         `ROI Processing Summary: ${results.successful} successful, ${
//           results.failed
//         } failed, Total ROI: ${results.total_roi_amount.toFixed(2)}`
//       );

//       return {
//         success: true,
//         ...results,
//       };
//     } catch (error) {
//       console.error("Error in processAllROI:", error);
//       throw error;
//     }
//   }

//   /**
//    * Process ROI for a specific user (Manual Type)
//    */
//   async processUserROI(userId) {
//     try {
//       await this.initializeSettings();

//       if (!this.roiSettings || !this.roiSettings.enabled) {
//         throw new Error("ROI processing is disabled");
//       }

//       // Check if this is manual type processing or allow both types for user-specific processing
//       if (
//         this.roiSettings.type !== "manual" &&
//         this.roiSettings.type !== "system"
//       ) {
//         throw new Error("Invalid ROI processing type");
//       }

//       const query = `
//         SELECT
//           ui.*,
//           ip.daily_roi_percentage,
//           ip.name as plan_name,
//           ip.duration_days,
//           ip.max_roi_amount
//         FROM user_investments ui
//         JOIN investment_plans ip ON ui.plan_id = ip.id
//         WHERE ui.user_id = ?
//         AND ui.status = 'active'
//         AND ui.end_date >= CURDATE()
//         AND (ui.last_roi_date IS NULL OR ui.last_roi_date < CURDATE())
//         AND ip.is_active = 1
//         ORDER BY ui.created_at ASC
//       `;

//       const [investments] = await this.connection.execute(query, [userId]);

//       if (investments.length === 0) {
//         return {
//           success: true,
//           message: "No eligible investments for this user",
//           processed: 0,
//         };
//       }

//       const results = {
//         user_id: userId,
//         total_processed: 0,
//         successful: 0,
//         failed: 0,
//         total_roi_amount: 0,
//         details: [],
//       };

//       for (const investment of investments) {
//         try {
//           const result = await this.processInvestmentROI(investment);

//           if (result.success) {
//             results.successful++;
//             results.total_roi_amount += result.roi_amount;
//             results.details.push(result);
//           } else {
//             results.failed++;
//           }
//         } catch (error) {
//           results.failed++;
//           console.error(
//             `Failed to process investment ${investment.id}:`,
//             error.message
//           );
//         }

//         results.total_processed++;
//       }

//       return {
//         success: true,
//         ...results,
//       };
//     } catch (error) {
//       console.error(`Error processing ROI for user ${userId}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Process ROI for multiple specific users (Manual Type)
//    */
//   async processMultipleUsersROI(userIds) {
//     try {
//       await this.initializeSettings();

//       if (!this.roiSettings || !this.roiSettings.enabled) {
//         throw new Error("ROI processing is disabled");
//       }

//       if (this.roiSettings.type !== "manual") {
//         throw new Error(
//           "Multiple user processing is only available for manual type"
//         );
//       }

//       const overallResults = {
//         total_users: userIds.length,
//         processed_users: 0,
//         successful_users: 0,
//         failed_users: 0,
//         total_roi_amount: 0,
//         user_results: [],
//       };

//       for (const userId of userIds) {
//         try {
//           const userResult = await this.processUserROI(userId);
//           overallResults.processed_users++;

//           if (userResult.success && userResult.successful > 0) {
//             overallResults.successful_users++;
//             overallResults.total_roi_amount += userResult.total_roi_amount;
//           } else if (!userResult.success) {
//             overallResults.failed_users++;
//           }

//           overallResults.user_results.push(userResult);
//         } catch (error) {
//           overallResults.failed_users++;
//           overallResults.user_results.push({
//             user_id: userId,
//             success: false,
//             error: error.message,
//           });
//         }
//       }

//       return {
//         success: true,
//         ...overallResults,
//       };
//     } catch (error) {
//       console.error("Error processing multiple users ROI:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get ROI processing statistics
//    */
//   async getROIStats() {
//     try {
//       const statsQuery = `
//         SELECT
//           COUNT(*) as total_active_investments,
//           SUM(invested_amount) as total_invested,
//           SUM(current_value) as total_current_value,
//           SUM(total_earned) as total_earned,
//           COUNT(CASE WHEN last_roi_date = CURDATE() THEN 1 END) as processed_today,
//           COUNT(CASE WHEN last_roi_date IS NULL OR last_roi_date < CURDATE() THEN 1 END) as pending_processing
//         FROM user_investments ui
//         JOIN investment_plans ip ON ui.plan_id = ip.id
//         WHERE ui.status = 'active'
//         AND ui.end_date >= CURDATE()
//         AND ip.is_active = 1
//       `;

//       const [stats] = await this.connection.execute(statsQuery);
//       return stats[0];
//     } catch (error) {
//       console.error("Error getting ROI stats:", error);
//       throw error;
//     }
//   }
// }

// module.exports = ROI;

const Transaction = require("../models/Transaction");
const SystemSettings = require("../models/SystemSettings");

class ROI {
  constructor(connection) {
    this.connection = connection;
    this.roiSettings = null;
    this.boosterSettings = null;
    this.allowDuplicateProcessing = true; // Default to true - allow duplicate processing
  }

  /**
   * Initialize ROI settings from system_setting table
   */
  async initializeSettings() {
    try {
      const settings = await SystemSettings.getValueByKey("roi_processing");
      if (settings) {
        // Parse to JSON if string, otherwise keep as-is
        this.roiSettings =
          typeof settings === "string" ? JSON.parse(settings) : settings;

        // Set duplicate processing flag from settings
        this.allowDuplicateProcessing =
          this.roiSettings.allow_duplicate_processing || false;
      } else {
        throw new Error("ROI processing settings not found or inactive");
      }

      // Initialize booster settings if enabled
      if (this.roiSettings.is_booster) {
        // const boosterSettings = await SystemSettings.getValueByKey(
        //   "roi_booster"
        // );
        // if (boosterSettings && boosterSettings.length > 0) {
        //   const settingValue = boosterSettings[0].setting_value;
        //   // Parse to JSON if string, otherwise keep as-is
        //   this.boosterSettings =
        //     typeof settingValue === "string"
        //       ? JSON.parse(settingValue)
        //       : settingValue;
        // } else {
        //   console.warn("ROI booster is enabled but booster settings not found");
        //   this.boosterSettings = null;
        // }
      }

      console.log(
        `ROI Settings initialized - Duplicate processing: ${
          this.allowDuplicateProcessing ? "ENABLED" : "DISABLED"
        }`
      );
    } catch (error) {
      console.error("Error initializing ROI settings:", error);
      throw error;
    }
  }

  /**
   * Set duplicate processing flag manually
   */
  setAllowDuplicateProcessing(allow) {
    this.allowDuplicateProcessing = allow;
    console.log(
      `Duplicate ROI processing ${allow ? "ENABLED" : "DISABLED"} manually`
    );
  }

  /**
   * Activate booster for a user
   */
  async activateBooster(userId, level = 1, days = 30, adminUserId = null) {
    try {
      await this.connection.beginTransaction();

      // Insert booster record
      const insertBoosterQuery = `
        INSERT INTO boosters (user_id, level, days, started_at, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW(), NOW())
      `;

      const [boosterResult] = await this.connection.execute(
        insertBoosterQuery,
        [userId, level, days]
      );

      const boosterId = boosterResult.insertId;

      await this.connection.commit();

      console.log(
        `Booster activated for user ${userId}: Level ${level}, ${days} days`
      );

      return {
        success: true,
        booster_id: boosterId,
        user_id: userId,
        level: level,
        days: days,
        message: `Booster Level ${level} activated successfully`,
      };
    } catch (error) {
      await this.connection.rollback();
      console.error(`Error activating booster for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get active boosters for a user
   */
  async getUserActiveBoosters(userId) {
    try {
      const query = `
        SELECT *
        FROM boosters 
        WHERE user_id = ? 
        AND DATE_ADD(started_at, INTERVAL days DAY) >= NOW()
        ORDER BY level DESC, started_at DESC
      `;

      const [boosters] = await this.connection.execute(query, [userId]);
      return boosters;
    } catch (error) {
      console.error(`Error getting active boosters for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get highest active booster level for a user
   */
  async getUserHighestBoosterLevel(userId) {
    try {
      const activeBoosters = await this.getUserActiveBoosters(userId);
      if (activeBoosters.length === 0) {
        return 1;
      }
      return Math.max(...activeBoosters.map((b) => b.level));
    } catch (error) {
      console.error(
        `Error getting highest booster level for user ${userId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Check if user has active booster
   */
  async hasActiveBooster(userId) {
    try {
      const activeBoosters = await this.getUserActiveBoosters(userId);
      return activeBoosters.length > 0;
    } catch (error) {
      console.error(`Error checking active booster for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get eligible investments with booster consideration and duplicate check
   */
  async getEligibleInvestments() {
    try {
      let duplicateCondition = "";
      if (!this.allowDuplicateProcessing) {
        duplicateCondition =
          "AND (ui.last_roi_date IS NULL OR ui.last_roi_date < CURDATE())";
      }

      const query = `
        SELECT 
          ui.*,
          ip.daily_roi_percentage,
          ip.name as plan_name,
          ip.duration_days,
          ip.max_roi_amount,
          (SELECT MAX(b.level) 
           FROM boosters b 
           WHERE b.user_id = ui.user_id 
           AND DATE_ADD(b.started_at, INTERVAL b.days DAY) >= NOW()
          ) as active_booster_level,
          CASE 
            WHEN ui.last_roi_date = CURDATE() THEN 1 
            ELSE 0 
          END as processed_today
        FROM user_investments ui
        JOIN investment_plans ip ON ui.plan_id = ip.id
        WHERE ui.status = 'active'
        AND ui.end_date >= CURDATE()
        ${duplicateCondition}
        AND ip.is_active = 1
        ORDER BY ui.created_at ASC
      `;

      const [investments] = await this.connection.execute(query);

      console.log(
        `Found ${
          investments.length
        } eligible investments (Duplicate processing: ${
          this.allowDuplicateProcessing ? "ENABLED" : "DISABLED"
        })`
      );

      return investments;
    } catch (error) {
      console.error("Error fetching eligible investments:", error);
      throw error;
    }
  }

  /**
   * Get user's first investment date (activation date)
   */
  async getUserActivationDate(userId) {
    try {
      const query = `
        SELECT MIN(start_date) as activation_date
        FROM user_investments 
        WHERE user_id = ? AND status IN ('active', 'completed')
      `;

      const [result] = await this.connection.execute(query, [userId]);
      return result[0]?.activation_date || null;
    } catch (error) {
      console.error(`Error getting activation date for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get user's direct referrals count within 7 days of activation
   */
  async getUserDirectCountWithinActivation(userId) {
    try {
      // First get the user's activation date
      const activationDate = await this.getUserActivationDate(userId);

      if (!activationDate) {
        console.log(`User ${userId} has no activation date`);
        return 0;
      }

      const query = `
        SELECT COUNT(*) as direct_count 
        FROM users 
        WHERE referrer_id = ? 
          AND status = 'active' 
          AND created_at >= ? 
          AND created_at <= DATE_ADD(?, INTERVAL 7 DAY)
      `;

      const [result] = await this.connection.execute(query, [
        userId,
        activationDate,
        activationDate,
      ]);

      const directCount = result[0].direct_count || 0;
      console.log(
        `User ${userId} has ${directCount} direct referrals within 7 days of activation (${activationDate})`
      );

      return directCount;
    } catch (error) {
      console.error(
        `Error getting direct count within activation for user ${userId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Check if user is newly activated (has investments)
   */
  async isUserNewlyActivated(userId) {
    try {
      const activationDate = await this.getUserActivationDate(userId);
      return activationDate !== null;
    } catch (error) {
      console.error(`Error checking user activation status ${userId}:`, error);
      return false;
    }
  }

  async calculateBoostedROI(userId, baseROIPercentage) {
    // FIXED: Ensure baseROIPercentage is a number
    let finalROI = parseFloat(baseROIPercentage) || 0;
    let appliedBoosts = {
      referral_boost: 0,
      booster_level_boost: 0,
      total_boost: 0,
    };

    // Apply referral-based boost (modified to work as booster levels)
    if (this.roiSettings.is_booster) {
      const isActivated = await this.isUserNewlyActivated(userId);

      console.log(`User ${userId} activation status: ${isActivated}`);

      if (isActivated) {
        const directCount = await this.getUserDirectCountWithinActivation(
          userId
        );
        let referralBoost = 0;
        let boosterLevel = 0; // Initialize booster level based on direct count

        // FIXED: Determine booster level based on direct referrals
        if (directCount >= 5) {
          referralBoost = 0.2; // +0.2% boost for 5+ directs (Level 2 booster)
          boosterLevel = 2;
        } else if (directCount >= 2) {
          referralBoost = 0.1; // +0.1% boost for 2+ directs (Level 1 booster)
          boosterLevel = 1;
        } else {
          // FIXED: 0 directs = no boost, no booster level
          referralBoost = 0;
          boosterLevel = 0;
        }

        if (referralBoost > 0) {
          finalROI += referralBoost;
          appliedBoosts.referral_boost = referralBoost;
          appliedBoosts.booster_level_boost = referralBoost; // Same as referral boost
          console.log(
            `User ${userId} referral boost applied: +${referralBoost}% (${directCount} directs, Level ${boosterLevel} booster)`
          );
        } else {
          console.log(
            `User ${userId} has ${directCount} directs, no referral boost applied`
          );
        }
      }
    }

    appliedBoosts.total_boost =
      appliedBoosts.referral_boost + appliedBoosts.booster_level_boost;

    if (finalROI !== parseFloat(baseROIPercentage)) {
      console.log(
        `User ${userId} total ROI enhancement: ${baseROIPercentage}% -> ${finalROI}% (Total boost: +${appliedBoosts.total_boost}%)`
      );
    }

    return { finalROI, appliedBoosts };
  }

  /**
   * Calculate daily ROI amount for an investment (combined base + booster)
   */
  async calculateDailyROI(investment) {
    // FIXED: Ensure invested_amount and daily_roi_percentage are numbers
    const investedAmount = parseFloat(investment.invested_amount) || 0;
    const baseROIPercentage = parseFloat(investment.daily_roi_percentage) || 0;

    // Get potentially boosted ROI percentage
    const { finalROI: effectiveROIPercentage, appliedBoosts } =
      await this.calculateBoostedROI(investment.user_id, baseROIPercentage);

    // FIXED: Calculate total ROI amount (base + booster combined) with proper number conversion
    const totalROIAmount = (investedAmount * effectiveROIPercentage) / 100;
    const baseROIAmount = (investedAmount * baseROIPercentage) / 100;
    const boosterAmount = totalROIAmount - baseROIAmount;

    // FIXED: Ensure total_earned is a number
    const currentTotalEarned = parseFloat(investment.total_earned) || 0;

    // Check if adding this ROI would exceed the maximum limit (2x invested amount)
    const maxAllowed = investedAmount * (this.roiSettings?.max_limit || 2);
    const newTotalEarned = currentTotalEarned + totalROIAmount;

    if (newTotalEarned > maxAllowed) {
      // Return the remaining amount to reach the limit
      const remainingAmount = Math.max(0, maxAllowed - currentTotalEarned);
      const adjustedBaseAmount = Math.min(baseROIAmount, remainingAmount);
      const adjustedBoosterAmount = Math.max(
        0,
        remainingAmount - adjustedBaseAmount
      );

      return {
        amount: remainingAmount,
        baseAmount: adjustedBaseAmount,
        boosterAmount: adjustedBoosterAmount,
        appliedBoosts,
      };
    }

    return {
      amount: totalROIAmount,
      baseAmount: baseROIAmount,
      boosterAmount: boosterAmount,
      appliedBoosts,
    };
  }

  /**
   * Check if investment should be marked as completed
   */
  shouldCompleteInvestment(investment, newTotalEarned) {
    const investedAmount = parseFloat(investment.invested_amount) || 0;
    const maxAllowed = investedAmount * (this.roiSettings?.max_limit || 2);
    return parseFloat(newTotalEarned) >= maxAllowed;
  }

  // Function to generate realistic trading transactions that sum up to the target ROI
  generateTradingTransactions(targetROIAmount, basePercentage, investment) {
    const numTransactions = Math.floor(Math.random() * 3) + 3; // 3-5 transactions
    const transactions = [];

    // Determine profit/loss ratio (ensure net positive to reach target)
    const profitTransactions = Math.ceil(numTransactions * 0.6); // At least 60% profitable
    const lossTransactions = numTransactions - profitTransactions;

    console.log(
      `Generating ${numTransactions} trading transactions (${profitTransactions} profits, ${lossTransactions} losses)`
    );

    // Create transaction types array and shuffle
    const transactionTypes = [
      ...Array(profitTransactions).fill("profit"),
      ...Array(lossTransactions).fill("loss"),
    ];

    // Shuffle array
    for (let i = transactionTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [transactionTypes[i], transactionTypes[j]] = [
        transactionTypes[j],
        transactionTypes[i],
      ];
    }

    // Calculate individual transaction amounts
    let remainingAmount = targetROIAmount;
    let totalGenerated = 0;

    // Generate random amounts for each transaction
    for (let i = 0; i < numTransactions; i++) {
      const isLast = i === numTransactions - 1;
      const isProfit = transactionTypes[i] === "profit";

      let amount;
      if (isLast) {
        // Last transaction gets the remaining amount to ensure exact total
        amount = remainingAmount;
      } else {
        if (isProfit) {
          // Profit transactions: 15% to 40% of target amount
          const minAmount = targetROIAmount * 0.15;
          const maxAmount = Math.min(
            targetROIAmount * 0.4,
            remainingAmount * 0.8
          );
          amount = Math.random() * (maxAmount - minAmount) + minAmount;
        } else {
          // Loss transactions: 5% to 20% of target amount (negative)
          const minLoss = targetROIAmount * 0.05;
          const maxLoss = Math.min(
            targetROIAmount * 0.2,
            Math.abs(remainingAmount) * 0.3
          );
          amount = -(Math.random() * (maxLoss - minLoss) + minLoss);
        }

        remainingAmount -= amount;
      }

      // Ensure we don't go too negative in intermediate transactions
      if (!isLast && remainingAmount < -targetROIAmount * 0.5) {
        amount = amount + (remainingAmount + targetROIAmount * 0.5);
        remainingAmount = -targetROIAmount * 0.5;
      }

      totalGenerated += amount;

      // Generate realistic trading details
      const tradingPairs = [
        "BTC/USD",
        "ETH/USD",
        "XRP/USD",
        "ADA/USD",
        "DOT/USD",
        "MATIC/USD",
        "AVAX/USD",
      ];
      const tradeTypes = [
        "Long Position",
        "Short Position",
        "Spot Trade",
        "Swing Trade",
      ];

      const percentage =
        (amount / parseFloat(investment.invested_amount)) * 100;

      transactions.push({
        amount: Math.abs(amount), // Keep full precision - no flooring
        type: isProfit ? "profit" : "loss",
        actualAmount: amount, // Keep original sign and full precision for calculations
        percentage: Math.abs(percentage), // Keep full precision
        actualPercentage: percentage, // Keep full precision
        tradingPair:
          tradingPairs[Math.floor(Math.random() * tradingPairs.length)],
        tradeType: tradeTypes[Math.floor(Math.random() * tradeTypes.length)],
        timestamp: new Date(Date.now() + i * (Math.random() * 3600000)), // Random times throughout the day
      });
    }

    // Verify total matches target (with small tolerance for floating point)
    const calculatedTotal = transactions.reduce(
      (sum, t) => sum + t.actualAmount,
      0
    );
    const difference = Math.abs(calculatedTotal - targetROIAmount);

    if (difference > 0.01) {
      console.warn(
        `⚠ Total mismatch: Generated ${calculatedTotal}, Target ${targetROIAmount}, Diff: ${difference}`
      );
      // Adjust the last transaction to match exactly - preserve full precision
      transactions[transactions.length - 1].actualAmount +=
        targetROIAmount - calculatedTotal;
      transactions[transactions.length - 1].amount = Math.abs(
        transactions[transactions.length - 1].actualAmount
      );
    }

    return transactions;
  }

  // Modified processInvestmentROI function to use trading transactions
  async processInvestmentROI(investment) {
    try {
      await this.connection.beginTransaction();

      const {
        amount: totalROIAmount,
        baseAmount,
        boosterAmount,
        appliedBoosts,
      } = await this.calculateDailyROI(investment);

      if (totalROIAmount <= 0) {
        console.log(
          `⚠ SKIPPED Investment ${investment.id} (User ${
            investment.user_id
          }): ROI limit reached (${investment.total_earned}/${
            (parseFloat(investment.invested_amount) || 0) *
            (this.roiSettings?.max_limit || 2)
          })`
        );
        await this.connection.rollback();
        return {
          success: false,
          message: "ROI limit reached",
          skip_reason: "roi_limit_reached",
          investment_id: investment.id,
          user_id: investment.user_id,
          current_earned: investment.total_earned,
          max_allowed:
            (parseFloat(investment.invested_amount) || 0) *
            (this.roiSettings?.max_limit || 2),
        };
      }

      // Generate trading transactions
      const baseROIPercentage =
        parseFloat(investment.daily_roi_percentage) || 0;
      const tradingTransactions = this.generateTradingTransactions(
        totalROIAmount,
        baseROIPercentage,
        investment
      );

      // FIXED: Ensure proper number conversion for database updates - preserve full precision
      const currentTotalEarned = parseFloat(investment.total_earned) || 0;
      const currentValue = parseFloat(investment.current_value) || 0;

      const newTotalEarned = currentTotalEarned + totalROIAmount;
      const newCurrentValue = currentValue + totalROIAmount;
      const shouldComplete = this.shouldCompleteInvestment(
        investment,
        newTotalEarned
      );

      // Get booster details for transaction
      const activeBoosters = await this.getUserActiveBoosters(
        investment.user_id
      );
      const highestBoosterLevel = await this.getUserHighestBoosterLevel(
        investment.user_id
      );

      // Update investment record - preserve full precision
      const updateInvestmentQuery = `
      UPDATE user_investments 
      SET 
        current_value = ?,
        total_earned = ?,
        last_roi_date = CURDATE(),
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

      await this.connection.execute(updateInvestmentQuery, [
        newCurrentValue, // Full precision maintained
        newTotalEarned, // Full precision maintained
        shouldComplete ? "completed" : "active",
        investment.id,
      ]);


   
      // Calculate boosted percentage (base + boosts) - preserve full precision
      const boostedROIPercentage =
        baseROIPercentage + appliedBoosts.total_boost;

      // Create individual trading transactions
      const createdTransactions = [];
      for (let i = 0; i < tradingTransactions.length; i++) {
        const trade = tradingTransactions[i];

        const transactionData = {
          user_id: investment.user_id,
          transaction_type: "roi_earning",
          amount: trade.amount, // Full precision - no flooring even for 0.0000000003
          fee_amount: 0,
          net_amount: trade.actualAmount, // Full precision - can be negative for losses
          currency: "USD",
          status: "completed",
          related_user_id: null,
          related_investment_id: investment.id,
          source_type: trade.type === 'profit' ? "internal" :'out',
          source_details: JSON.stringify({
            investment_id: investment.id,
            plan_name: investment.plan_name,
            invested_amount: parseFloat(investment.invested_amount) || 0,
            trade_sequence: i + 1,
            total_trades: tradingTransactions.length,
            trading_pair: trade.tradingPair,
            trade_type: trade.tradeType,
            trade_percentage: trade.actualPercentage, // Full precision maintained
            trade_result: trade.type,
            daily_roi_percentage: baseROIPercentage,
            boosted_roi_percentage: boostedROIPercentage,
            processing_date: trade.timestamp.toISOString(),
            boost_applied: appliedBoosts.total_boost > 0,
            referral_boost: appliedBoosts.referral_boost,
            referral_level: appliedBoosts.referral_level || 0,
            booster_level_boost: appliedBoosts.booster_level_boost,
            active_booster_level: highestBoosterLevel,
            is_partial_roi: true,
            parent_roi_amount: totalROIAmount, // Full precision maintained
          }),
          processed_by: investment.user_id,
          processed_at: trade.timestamp,
          admin_notes: `${
            trade.type === "profit" ? "📈" : "📉"
          } Trading ${trade.type.toUpperCase()}: ${trade.tradingPair} ${
            trade.tradeType
          } | ${trade.actualPercentage}% | ${
            trade.actualAmount >= 0 ? "+" : ""
          }${trade.actualAmount} USD | Trade ${i + 1}/${
            tradingTransactions.length
          } for Investment #${investment.id}`,
        };

        const transaction = new Transaction(transactionData);
        console.log(transaction)
        await transaction.create(this.connection);
        createdTransactions.push({
          ...transactionData,
          id: transaction.id,
          trading_details: trade,
        });
      }

      await this.connection.commit();

      const profitTrades = tradingTransactions.filter(
        (t) => t.type === "profit"
      ).length;
      const lossTrades = tradingTransactions.filter(
        (t) => t.type === "loss"
      ).length;

      console.log(
        `✓ Processed ${
          tradingTransactions.length
        } Trading Transactions for Investment ${investment.id} (User ${
          investment.user_id
        }): ${profitTrades} profits, ${lossTrades} losses | Net ROI: ${totalROIAmount} USD (${boostedROIPercentage}%)${
          highestBoosterLevel > 0 ? ` [L${highestBoosterLevel}]` : ""
        }${
          appliedBoosts.referral_level > 0
            ? ` [RL${appliedBoosts.referral_level}]`
            : ""
        }`
      );

      return {
        success: true,
        investment_id: investment.id,
        user_id: investment.user_id,
        total_roi_amount: totalROIAmount, // Full precision maintained
        base_roi_amount: baseAmount, // Full precision maintained
        booster_amount: boosterAmount, // Full precision maintained
        total_earned: newTotalEarned, // Full precision maintained
        completed: shouldComplete,
        trading_transactions: createdTransactions,
        transaction_summary: {
          total_trades: tradingTransactions.length,
          profit_trades: profitTrades,
          loss_trades: lossTrades,
          net_amount: totalROIAmount, // Full precision maintained
        },
        booster_level: highestBoosterLevel,
        referral_level: appliedBoosts.referral_level || 0,
        active_boosters: activeBoosters.length,
        applied_boosts: appliedBoosts,
        base_percentage: baseROIPercentage,
        boosted_percentage: boostedROIPercentage,
        transaction_type: "trading_roi_split",
      };
    } catch (error) {
      await this.connection.rollback();
      console.error(
        `✗ ERROR processing Investment ${investment.id} (User ${investment.user_id}):`,
        error.message
      );
      throw error;
    }
  }

  async processAllROI() {
    try {
      // Initialize settings
      await this.initializeSettings();

      if (!this.roiSettings || !this.roiSettings.enabled) {
        console.log("⚠ ROI processing is disabled in system settings");
        return { success: false, message: "ROI processing is disabled" };
      }

      // Check if this is system type processing
      if (this.roiSettings.type !== "system") {
        console.log(
          "⚠ ROI processing type is not 'system', use processUserROI for manual processing"
        );
        return {
          success: false,
          message: "Use processUserROI for manual processing",
        };
      }

      const eligibleInvestments = await this.getEligibleInvestments();

      if (eligibleInvestments.length === 0) {
        console.log("ℹ No eligible investments found for ROI processing");
        return {
          success: true,
          message: "No eligible investments",
          processed: 0,
        };
      }

      const results = {
        total_processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        total_roi_amount: 0,
        total_base_amount: 0,
        total_booster_amount: 0,
        skip_reasons: {},
        details: [],
      };

      console.log(
        `🚀 Starting ROI processing for ${
          eligibleInvestments.length
        } investments (Duplicate processing: ${
          this.allowDuplicateProcessing ? "ENABLED" : "DISABLED"
        })`
      );

      for (const investment of eligibleInvestments) {
        try {
          const result = await this.processInvestmentROI(investment);

          if (result.success) {
            results.successful++;
            results.total_roi_amount += result.total_roi_amount || 0;
            results.total_base_amount += result.base_roi_amount || 0;
            results.total_booster_amount += result.booster_amount || 0;
            results.details.push(result);
          } else {
            results.skipped++;
            // Track skip reasons
            const skipReason = result.skip_reason || "unknown";
            results.skip_reasons[skipReason] =
              (results.skip_reasons[skipReason] || 0) + 1;

            console.log(
              `⚠ SKIPPED Investment ${investment.id} (User ${investment.user_id}): ${result.message} [Reason: ${skipReason}]`
            );
          }
        } catch (error) {
          results.failed++;
          console.error(
            `✗ FAILED Investment ${investment.id} (User ${investment.user_id}):`,
            error.message
          );
        }

        results.total_processed++;
      }

      console.log(`\n✅ ROI Processing Completed Successfully!`);
      console.log(
        `📊 Final Results: ${results.successful} processed, ${
          results.failed
        } failed, Total ROI: $${results.total_roi_amount.toFixed(4)}`
      );

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error("Error in processAllROI:", error);
      throw error;
    }
  }

  /**
   * Process ROI for a specific user (Manual Type)
   */
  async processUserROI(userId) {
    try {
      await this.initializeSettings();

      if (!this.roiSettings || !this.roiSettings.enabled) {
        throw new Error("ROI processing is disabled");
      }

      // Check if this is manual type processing or allow both types for user-specific processing
      if (
        this.roiSettings.type !== "manual" &&
        this.roiSettings.type !== "system"
      ) {
        throw new Error("Invalid ROI processing type");
      }

      let duplicateCondition = "";
      // if (!this.allowDuplicateProcessing) {
      //   duplicateCondition =
      //     "AND (ui.last_roi_date IS NULL OR ui.last_roi_date < CURDATE())";
      // }

      const query = `
        SELECT 
          ui.*,
          ip.daily_roi_percentage,
          ip.name as plan_name,
          ip.duration_days,
          ip.max_roi_amount,
          CASE 
            WHEN ui.last_roi_date = CURDATE() THEN 1 
            ELSE 0 
          END as processed_today
        FROM user_investments ui
        JOIN investment_plans ip ON ui.plan_id = ip.id
        WHERE ui.user_id = ?
        AND ui.status = 'active'
        AND ui.end_date >= CURDATE()
        ${duplicateCondition}
        AND ip.is_active = 1
        ORDER BY ui.created_at ASC
      `;

      const [investments] = await this.connection.execute(query, [userId]);

      if (investments.length === 0) {
        console.log(`ℹ User ${userId}: No eligible investments found`);
        return {
          success: true,
          message: "No eligible investments for this user",
          processed: 0,
        };
      }

      const results = {
        user_id: userId,
        total_processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        total_roi_amount: 0,
        total_base_amount: 0,
        total_booster_amount: 0,
        skip_reasons: {},
        details: [],
      };

      console.log(
        `🚀 Processing ROI for User ${userId}: ${investments.length} investments`
      );

      for (const investment of investments) {
        try {
          const result = await this.processInvestmentROI(investment);

          if (result.success) {
            results.successful++;
            results.total_roi_amount += result.total_roi_amount || 0;
            results.total_base_amount += result.base_roi_amount || 0;
            results.total_booster_amount += result.booster_amount || 0;
            results.details.push(result);
          } else {
            results.skipped++;
            const skipReason = result.skip_reason || "unknown";
            results.skip_reasons[skipReason] =
              (results.skip_reasons[skipReason] || 0) + 1;
          }
        } catch (error) {
          results.failed++;
          console.error(
            `Failed to process investment ${investment.id}:`,
            error.message
          );
        }

        results.total_processed++;
      }

      console.log(
        `✅ User ${userId} Completed: ${results.successful} processed, ${
          results.failed
        } failed, Total ROI: $${results.total_roi_amount.toFixed(4)}`
      );

      return {
        success: true,
        ...results,
      };
    } catch (error) {
      console.error(`Error processing ROI for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Process ROI for multiple specific users (Manual Type)
   */
  async processMultipleUsersROI(userIds) {
    try {
      await this.initializeSettings();

      if (!this.roiSettings || !this.roiSettings.enabled) {
        throw new Error("ROI processing is disabled");
      }

      if (this.roiSettings.type !== "manual") {
        throw new Error(
          "Multiple user processing is only available for manual type"
        );
      }

      const overallResults = {
        total_users: userIds.length,
        processed_users: 0,
        successful_users: 0,
        failed_users: 0,
        total_roi_amount: 0,
        total_base_amount: 0,
        total_booster_amount: 0,
        user_results: [],
      };

      console.log(`🚀 Processing ROI for ${userIds.length} users`);

      for (const userId of userIds) {
        try {
          const userResult = await this.processUserROI(userId);
          overallResults.processed_users++;

          if (userResult.success && userResult.successful > 0) {
            overallResults.successful_users++;
            overallResults.total_roi_amount += userResult.total_roi_amount || 0;
            overallResults.total_base_amount +=
              userResult.total_base_amount || 0;
            overallResults.total_booster_amount +=
              userResult.total_booster_amount || 0;
          } else if (!userResult.success) {
            overallResults.failed_users++;
          }

          overallResults.user_results.push(userResult);
        } catch (error) {
          overallResults.failed_users++;
          overallResults.user_results.push({
            user_id: userId,
            success: false,
            error: error.message,
          });
        }
      }

      console.log(
        `✅ Multiple Users Completed: ${overallResults.successful_users} successful, ${overallResults.failed_users} failed`
      );

      return {
        success: true,
        ...overallResults,
      };
    } catch (error) {
      console.error("Error processing multiple users ROI:", error);
      throw error;
    }
  }

  /**
   * Reset ROI processing for specific investments (Admin function)
   * This allows reprocessing investments that were already processed today
   */
  async resetInvestmentROI(investmentIds, adminUserId) {
    try {
      if (!Array.isArray(investmentIds) || investmentIds.length === 0) {
        throw new Error("Investment IDs array is required");
      }

      await this.connection.beginTransaction();

      const placeholders = investmentIds.map(() => "?").join(",");
      const resetQuery = `
        UPDATE user_investments 
        SET last_roi_date = NULL,
            updated_at = NOW()
        WHERE id IN (${placeholders})
        AND status = 'active'
      `;

      const [result] = await this.connection.execute(resetQuery, investmentIds);

      // Log the reset action
      const logQuery = `
        INSERT INTO admin_logs (admin_user_id, action, details, created_at)
        VALUES (?, 'roi_reset', ?, NOW())
      `;

      await this.connection.execute(logQuery, [
        adminUserId,
        JSON.stringify({
          investment_ids: investmentIds,
          reset_count: result.affectedRows,
          timestamp: new Date().toISOString(),
          reason: "Manual ROI processing reset",
        }),
      ]);

      await this.connection.commit();

      console.log(
        `✓ Reset ROI processing for ${result.affectedRows} investments by admin ${adminUserId}`
      );

      return {
        success: true,
        reset_count: result.affectedRows,
        investment_ids: investmentIds,
        admin_user_id: adminUserId,
      };
    } catch (error) {
      await this.connection.rollback();
      console.error("Error resetting investment ROI:", error);
      throw error;
    }
  }

  /**
   * Get investments that can be reset (already processed today)
   */
  async getResettableInvestments() {
    try {
      const query = `
        SELECT 
          ui.id,
          ui.user_id,
          ui.invested_amount,
          ui.current_value,
          ui.total_earned,
          ui.last_roi_date,
          ip.name as plan_name,
          ip.daily_roi_percentage,
          u.email as user_email
        FROM user_investments ui
        JOIN investment_plans ip ON ui.plan_id = ip.id
        LEFT JOIN users u ON ui.user_id = u.id
        WHERE ui.status = 'active'
        AND ui.end_date >= CURDATE()
        AND ui.last_roi_date = CURDATE()
        AND ip.is_active = 1
        ORDER BY ui.last_roi_date DESC, ui.id ASC
      `;

      const [investments] = await this.connection.execute(query);
      return investments;
    } catch (error) {
      console.error("Error getting resettable investments:", error);
      throw error;
    }
  }
}

module.exports = ROI;
