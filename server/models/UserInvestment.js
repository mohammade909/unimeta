const Database = require("../database");
const SystemSettings = require("../models/SystemSettings");
const logger = require("../utils/logger");
const Wallet = require("../models/Wallet");
// settings key direct_income {"amount": "0", "enabled": true, "max_level": 4, "percentage": "5"}
class UserInvestment {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.plan_id = data.plan_id || null;
    this.invested_amount = data.invested_amount || 0.0;
    this.current_value = data.current_value || 0.0;
    this.total_earned = data.total_earned || 0.0;
    this.status = data.status || "active";
    this.start_date = data.start_date || null;
    this.end_date = data.end_date || null;
    this.last_roi_date = data.last_roi_date || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }
  // Create logger instance
  async create() {

    const sql = `
    INSERT INTO user_investments (
      user_id, plan_id, invested_amount, current_value, 
      total_earned, status, start_date, end_date, 
      last_roi_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

    const params = [
      this.user_id,
      this.plan_id,
      this.invested_amount,
      this.current_value || this.invested_amount,
      this.total_earned,
      this.status,
      this.start_date,
      this.end_date,
      this.last_roi_date,
    ];



    try {
      const result = await Database.query(sql, params);
      this.id = result.insertId;

      return this;
    } catch (error) {
      throw error;
    }
  }

  static async distributeCommission(
    connection,
    userId,
    investmentAmount,
    investmentId
  ) {

    try {
      // Get commission settings
      const commissionSettingsRaw = await SystemSettings.getValueByKey(
        "direct_income"
      );


      // Parse commission settings if it's a string
      let commissionSettings;
      try {
        if (typeof commissionSettingsRaw === "string") {
          commissionSettings = JSON.parse(commissionSettingsRaw);

        } else if (
          typeof commissionSettingsRaw === "object" &&
          commissionSettingsRaw !== null
        ) {
          commissionSettings = commissionSettingsRaw;
        } else {
          return {
            success: true,
            message: "Invalid commission settings format",
          };
        }
      } catch (parseError) {
        logger.error(
          "❌ Failed to parse commission settings JSON:",
          parseError
        );
        return {
          success: true,
          message: "Failed to parse commission settings",
        };
      }


      // Check if commission distribution is enabled
      if (!commissionSettings || !commissionSettings.enabled) {
        return {
          success: true,
          message: "Commission distribution is disabled",
        };
      }

      // Extract max_level and percentages with validation
      const { max_level, percentages } = commissionSettings;


      if (!max_level || max_level <= 0) {
        return { success: true, message: "Invalid commission settings" };
      }

      // Validate percentages
      if (percentages && typeof percentages !== "object") {
        return { success: true, message: "Invalid percentages configuration" };
      }

      const referrerChain = await this.getReferrerChain(userId, max_level);



      if (referrerChain.length === 0) {
        return { success: true, message: "No referrers found" };
      }

      // Distribute commission to each level
      let totalCommissionDistributed = 0;
      const processedLevels = [];

      for (let level = 1; level <= referrerChain.length; level++) {
        const referrer = referrerChain[level - 1];


        // Get percentage for this level with improved logic
        let percentage = 0;

        // Check if percentages exist and has this level
        if (
          percentages &&
          percentages[level] !== undefined &&
          percentages[level] !== null
        ) {
          percentage = parseFloat(percentages[level]) || 0;

        } else if (
          percentages &&
          percentages[level.toString()] !== undefined &&
          percentages[level.toString()] !== null
        ) {
          // Check if level is stored as string key
          percentage = parseFloat(percentages[level.toString()]) || 0;

        } else {
          // Default percentages
          switch (level) {
            case 1:
              percentage = 5; // 5%
              break;
            case 2:
              percentage = 2; // 2%
              break;
            case 3:
              percentage = 1; // 1%
              break;
            default:
              percentage = 0.5; // 0.5%
          }
        }


        if (percentage > 0) {
          const commissionAmount = (investmentAmount * percentage) / 100;


          try {
            const result = await this.processCommissionForUser(
              connection,
              referrer,
              commissionAmount,
              userId,
              investmentId,
              level,
              percentage,
              investmentAmount
            );

            if (result.success) {

              totalCommissionDistributed += commissionAmount;
              processedLevels.push({
                level,
                referrer: referrer.username,
                referrer_id: referrer.id,
                amount: parseFloat(commissionAmount.toFixed(2)),
                percentage,
                transaction_id: result.transaction_id,
              });
            } else {


              // Add failed level to tracking
              processedLevels.push({
                level,
                referrer: referrer.username,
                referrer_id: referrer.id,
                amount: 0,
                percentage,
                status: "failed",
                error: result.message || "Unknown error",
              });
            }
          } catch (error) {


            // Add error level to tracking
            processedLevels.push({
              level,
              referrer: referrer.username,
              referrer_id: referrer.id,
              amount: 0,
              percentage,
              status: "error",
              error: error.message,
            });


          }
        } else {

          // Track skipped levels
          processedLevels.push({
            level,
            referrer: referrer.username,
            referrer_id: referrer.id,
            amount: 0,
            percentage: 0,
            status: "skipped",
            reason: "Zero percentage",
          });
        }
      }


      const summary = {
        total_distributed: parseFloat(totalCommissionDistributed.toFixed(2)),
        levels_processed: processedLevels.length,
        successful_levels: processedLevels.filter(
          (level) =>
            level.status !== "failed" &&
            level.status !== "error" &&
            level.status !== "skipped"
        ).length,
        failed_levels: processedLevels.filter(
          (level) => level.status === "failed" || level.status === "error"
        ).length,
        skipped_levels: processedLevels.filter(
          (level) => level.status === "skipped"
        ).length,
        processed_levels: processedLevels,
        commission_settings_used: {
          max_level,
          percentages,
          enabled: commissionSettings.enabled,
        },
      };


      return {
        success: true,
        message: "Commission distribution completed",
        summary: summary,
      };
    } catch (error) {
      logger.error("❌ Error in commission distribution:", error);
      throw error;
    }
  }
  // Get referrer chain up to max_level
  static async getReferrerChain(userId, maxLevel) {
    console.log(`\n=== Building Referrer Chain ===`);
    console.log(`Starting with user ID: ${userId}, max levels: ${maxLevel}`);

    const referrerChain = [];
    let currentUserId = userId;
    let level = 0;

    while (level < maxLevel && currentUserId) {
      console.log(
        `\nSearching for referrer at level ${level + 1
        } for user ${currentUserId}`
      );

      const sql = `
        SELECT u.id, u.username, u.email, u.referrer_id, u.status,
               u.full_name, u.referral_code
        FROM users u 
        WHERE u.id = (
          SELECT referrer_id FROM users WHERE id = ?
        ) AND u.status = 'active'
      `;

      try {
        const result = await Database.query(sql, [currentUserId]);
        console.log(
          `Query executed for user ${currentUserId}, found ${result.length} referrers`
        );

        if (result.length === 0) {
          console.log(
            `No active referrer found for user ${currentUserId} at level ${level + 1
            }`
          );
          break; // No more referrers
        }

        const referrer = result[0];
        console.log(
          `Found referrer: ${referrer.username} (ID: ${referrer.id}, Status: ${referrer.status})`
        );

        referrerChain.push(referrer);
        currentUserId = referrer.id;
        level++;

        console.log(`Added to chain - Level ${level}: ${referrer.username}`);
      } catch (error) {
        console.error(
          `Error querying referrer for user ${currentUserId}:`,
          error
        );
        break;
      }
    }

    console.log(
      `\nReferrer chain complete: ${referrerChain.length} levels found`
    );
    return referrerChain;
  }

  // static async processCommissionForUser(
  //   connection,
  //   referrer,
  //   commissionAmount,
  //   fromUserId,
  //   investmentId,
  //   level,
  //   percentage,
  //   originalAmount
  // ) {
  //   console.log(
  //     `\n--- Processing Commission for User ${referrer.username} ---`
  //   );
  //   console.log(`Commission Amount: $${commissionAmount}`);
  //   console.log(`Level: ${level}`);
  //   console.log(`Percentage: ${percentage}%`);
  //   console.log(`Original Investment: $${originalAmount}`);

  //   try {
  //     const Transaction = require("./Transaction");
  //     const User = require("./User");

  //     // Get the user details for fromUserId
  //     console.log(`Fetching details for investor (user ID: ${fromUserId})`);
  //     const fromUser = await User.findById(fromUserId);

  //     if (!fromUser) {
  //       console.error(`❌ User with ID ${fromUserId} not found`);
  //       throw new Error(`User with ID ${fromUserId} not found`);
  //     }

  //     console.log(`Investor details: ${fromUser.username} (${fromUser.email})`);

  //     // Prepare source details for the commission transaction
  //     const sourceDetails = {
  //       description: `Level ${level} commission from investment`,
  //       investment_id: investmentId,
  //       from_user_id: fromUserId,
  //       username: fromUser.username,
  //       email: fromUser.email,
  //       referral_code: fromUser.referral_code,
  //       level: level,
  //       percentage: percentage,
  //       original_amount: originalAmount,
  //       commission_amount: commissionAmount,
  //     };

  //     console.log(
  //       `Prepared source details:`,
  //       JSON.stringify(sourceDetails, null, 2)
  //     );

  //     // Create new transaction using the Transaction model
  //     console.log(`Creating commission transaction...`);
  //     const commissionTransaction = new Transaction({
  //       user_id: referrer.id,
  //       transaction_type: "direct_bonus",
  //       amount: commissionAmount,
  //       fee_amount: 0,
  //       net_amount: commissionAmount,
  //       currency: "USD",
  //       status: "completed",
  //       related_user_id: fromUserId,
  //       related_investment_id: investmentId,
  //       source_type: "internal",
  //       source_details: JSON.stringify(sourceDetails),
  //       processed_by: null,
  //       processed_at: new Date(),
  //       admin_notes: `Direct ${level} commission (${percentage}%) from user ${fromUserId}`,
  //     });

  //     console.log(`Transaction object created, saving to database...`);
  //     // Save the transaction using the model's create method
  //     await commissionTransaction.create(connection);
  //     console.log(`✅ Transaction saved with ID: ${commissionTransaction.id}`);

  //     // Update user's updated_at timestamp
  //     console.log(`Updating user ${referrer.id} timestamp...`);
  //     const updateUserSql = `
  //     UPDATE users SET 
  //       updated_at = NOW()
  //     WHERE id = ?
  //   `;
  //     await connection.execute(updateUserSql, [referrer.id]);
  //     console.log(`✅ User timestamp updated`);

  //     console.log(
  //       `✅ Commission processed successfully for user ${referrer.id} (${referrer.username}): $${commissionAmount} at level ${level}`
  //     );

  //     return {
  //       success: true,
  //       transaction_id: commissionTransaction.id,
  //       transaction: commissionTransaction,
  //       amount: commissionAmount,
  //       level: level,
  //       referrer: referrer,
  //     };
  //   } catch (error) {
  //     console.error(
  //       `❌ Error processing commission for user ${referrer.id}:`,
  //       error
  //     );
  //     console.error("Error details:", error.message);
  //     console.error("Error stack:", error.stack);
  //     throw error;
  //   }
  // }

  static async processCommissionForUser(
    connection,
    referrer,
    commissionAmount,
    fromUserId,
    investmentId,
    level,
    percentage,
    originalAmount
  ) {
    console.log(
      `\n--- Processing Commission for User ${referrer.username} ---`
    );
    console.log(`Commission Amount: $${commissionAmount}`);
    console.log(`Level: ${level}`);
    console.log(`Percentage: ${percentage}%`);
    console.log(`Original Investment: $${originalAmount}`);

    try {
      const Transaction = require("./Transaction");
      const User = require("./User");

      // Get the user details for fromUserId
      console.log(`Fetching details for investor (user ID: ${fromUserId})`);
      const fromUser = await User.findById(fromUserId);

      if (!fromUser) {
        console.error(`❌ User with ID ${fromUserId} not found`);
        throw new Error(`User with ID ${fromUserId} not found`);
      }

      console.log(`Investor details: ${fromUser.username} (${fromUser.email})`);

      // Get referrer's wallet details to check current balances and total invested
      console.log(`Fetching wallet details for referrer (user ID: ${referrer.id})`);

      const wallet = await Wallet.findByUserId(referrer.id);
    
      const currentRoiBalance = parseFloat(wallet.roi_balance) || 0;
      const currentCommissionBalance = parseFloat(wallet.commission_balance) || 0;
      const totalInvested = parseFloat(wallet.total_invested) || 0;

      // Calculate current total earnings
      const currentTotalEarnings = currentRoiBalance + currentCommissionBalance;

      // Calculate the earnings cap (4x total invested)
      const earningsCap = totalInvested * 4;

      // Calculate remaining capacity
      const remainingCapacity = earningsCap - currentTotalEarnings;

      console.log(`Current ROI Balance: $${currentRoiBalance}`);
      console.log(`Current Commission Balance: $${currentCommissionBalance}`);
      console.log(`Current Total Earnings: $${currentTotalEarnings}`);
      console.log(`Total Invested: $${totalInvested}`);
      console.log(`Earnings Cap (4x): $${earningsCap}`);
      console.log(`Remaining Capacity: $${remainingCapacity}`);

      // Check if user has already reached the cap
      if (remainingCapacity <= 0) {
        console.log(`⚠️ User ${referrer.username} has already reached the earnings cap. No commission will be added.`);
        return {
          success: true,
          transaction_id: null,
          transaction: null,
          amount: 0,
          actualAmount: 0,
          cappedAmount: commissionAmount,
          level: level,
          referrer: referrer,
          message: "Commission not added - earnings cap reached"
        };
      }

      // Calculate the actual commission amount to add (capped if necessary)
      const actualCommissionAmount = Math.min(commissionAmount, remainingCapacity);
      const cappedAmount = commissionAmount - actualCommissionAmount;

      console.log(`Requested Commission: $${commissionAmount}`);
      console.log(`Actual Commission to Add: $${actualCommissionAmount}`);
      console.log(`Capped Amount: $${cappedAmount}`);

      // Only proceed if there's an amount to add
      if (actualCommissionAmount <= 0) {
        console.log(`⚠️ No commission to add after applying cap.`);
        return {
          success: true,
          transaction_id: null,
          transaction: null,
          amount: 0,
          actualAmount: 0,
          cappedAmount: commissionAmount,
          level: level,
          referrer: referrer,
          message: "Commission not added - would exceed earnings cap"
        };
      }

      // Prepare source details for the commission transaction
      const sourceDetails = {
        description: `Level ${level} commission from investment`,
        investment_id: investmentId,
        from_user_id: fromUserId,
        username: fromUser.username,
        email: fromUser.email,
        referral_code: fromUser.referral_code,
        level: level,
        percentage: percentage,
        original_amount: originalAmount,
        requested_commission_amount: commissionAmount,
        actual_commission_amount: actualCommissionAmount,
        capped_amount: cappedAmount,
        earnings_cap: earningsCap,
        current_total_earnings: currentTotalEarnings,
        remaining_capacity: remainingCapacity
      };

      console.log(
        `Prepared source details:`,
        JSON.stringify(sourceDetails, null, 2)
      );

      // Create new transaction using the Transaction model
      console.log(`Creating commission transaction...`);
      const commissionTransaction = new Transaction({
        user_id: referrer.id,
        transaction_type: "direct_bonus",
        amount: actualCommissionAmount,
        fee_amount: 0,
        net_amount: actualCommissionAmount,
        currency: "USD",
        status: "completed",
        related_user_id: fromUserId,
        related_investment_id: investmentId,
        source_type: "internal",
        source_details: JSON.stringify(sourceDetails),
        processed_by: null,
        processed_at: new Date(),
        admin_notes: `Direct ${level} commission (${percentage}%) from user ${fromUserId}. Original: $${commissionAmount}, Actual: $${actualCommissionAmount}${cappedAmount > 0 ? `, Capped: $${cappedAmount}` : ''}`,
      });

      console.log(`Transaction object created, saving to database...`);
      // Save the transaction using the model's create method
      await commissionTransaction.create(connection);
      console.log(`✅ Transaction saved with ID: ${commissionTransaction.id}`);

      // const updateWalletSql = `
      //   UPDATE user_wallets SET 
      //     commission_balance = commission_balance + ?,
      //     last_updated = NOW()
      //   WHERE user_id = ?
      // `;
      // await connection.execute(updateWalletSql, [actualCommissionAmount, referrer.id]);

      // Update user's updated_at timestamp
      console.log(`Updating user ${referrer.id} timestamp...`);
      const updateUserSql = `
        UPDATE users SET 
          updated_at = NOW()
        WHERE id = ?
      `;
      await connection.execute(updateUserSql, [referrer.id]);
      console.log(`✅ User timestamp updated`);

      const successMessage = cappedAmount > 0
        ? `Commission processed with cap applied: $${actualCommissionAmount} added (${cappedAmount} capped)`
        : `Commission processed successfully: $${actualCommissionAmount} added`;

      console.log(
        `✅ ${successMessage} for user ${referrer.id} (${referrer.username}) at level ${level}`
      );

      return {
        success: true,
        transaction_id: commissionTransaction.id,
        transaction: commissionTransaction,
        amount: actualCommissionAmount,
        actualAmount: actualCommissionAmount,
        cappedAmount: cappedAmount,
        level: level,
        referrer: referrer,
        message: successMessage
      };
    } catch (error) {
      console.error(
        `❌ Error processing commission for user ${referrer.id}:`,
        error
      );
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  }

  static async investMoney(investmentData, transactionData = {}) {
    const connection = await Database.beginTransaction();

    try {
      // Validate required investment data
      if (
        !investmentData.user_id ||
        !investmentData.plan_id ||
        !investmentData.invested_amount
      ) {
        throw new Error(
          "Missing required investment data: user_id, plan_id, and invested_amount are required"
        );
      }

      // Validate required dates
      if (!investmentData.start_date || !investmentData.end_date) {
        throw new Error(
          "Missing required dates: start_date and end_date are required"
        );
      }

      // First create the user investment
      const investmentSql = `
        INSERT INTO user_investments (
          user_id, plan_id, invested_amount, current_value, 
          total_earned, status, start_date, end_date, 
          last_roi_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const investmentParams = [
        investmentData.user_id,
        investmentData.plan_id,
        investmentData.invested_amount,
        investmentData.current_value || investmentData.invested_amount,
        investmentData.total_earned || 0.0,
        investmentData.status || "active",
        investmentData.start_date,
        investmentData.end_date,
        investmentData.last_roi_date || null,
      ];

      const investmentResult = await connection.execute(
        investmentSql,
        investmentParams
      );

      const investmentId =
        investmentResult.insertId || investmentResult[0]?.insertId;
      if (!investmentId) {
        throw new Error(
          "Failed to create investment - no investment ID returned"
        );
      }

      // Prepare source details
      let sourceDetails = transactionData.source_details || {
        description: "Investment in plan",
        investment_id: investmentId,
        plan_id: investmentData.plan_id,
      };
      if (typeof sourceDetails === "string") {
        sourceDetails = { description: sourceDetails };
      }
      sourceDetails.investment_id = investmentId;

      // Create transaction record using the SAME connection
      const Transaction = require("./Transaction");

      const transaction = new Transaction({
        user_id: investmentData.user_id,
        transaction_type: "invest",
        amount: investmentData.invested_amount,
        fee_amount: transactionData.fee_amount || 0,
        net_amount:
          investmentData.invested_amount - (transactionData.fee_amount || 0),
        currency: transactionData.currency || "USD",
        status: "completed",
        related_user_id: transactionData.related_user_id,
        related_investment_id: investmentId,
        source_type: "internal",
        source_details: JSON.stringify(sourceDetails),
        processed_by: transactionData.processed_by || null,
        processed_at: new Date(),
        admin_notes: transactionData.admin_notes || null,
      });

      // CRITICAL FIX: Pass the connection to the transaction create method
      try {
        await transaction.create(connection);
        console.log("Transaction created with ID:", transaction.id);
      } catch (transactionError) {
        console.error("Transaction creation error:", transactionError);
        throw new Error(
          `Failed to create transaction: ${transactionError.message}`
        );
      }

      // DISTRIBUTE COMMISSION TO REFERRERS
      try {
        await this.distributeCommission(
          connection,
          investmentData.user_id,
          investmentData.invested_amount,
          investmentId
        );
        console.log("Commission distribution completed");
      } catch (commissionError) {
        console.error("Commission distribution error:", commissionError);
      }

      // Get the created investment with related data
      const selectSql = `
        SELECT i.*, 
               u.username, u.email,
               p.name as plan_name, p.daily_roi_percentage, p.duration_days
        FROM user_investments i 
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN investment_plans p ON i.plan_id = p.id
        WHERE i.id = ?
      `;

      const [investmentRows] = await connection.execute(selectSql, [
        investmentId,
      ]);

      await connection.commit();
      connection.release();

      const investment =
        investmentRows.length > 0
          ? new UserInvestment(investmentRows[0])
          : null;

      return {
        success: true,
        investment: investment,
        investment_id: investmentId,
        transaction_id: transaction.id,
        message: "Investment created successfully with commission distribution",
      };
    } catch (error) {
      console.error("Investment creation error:", error);
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Instance method to invest additional money into existing investment
  async investAdditionalMoney(id, amount, transactionData = {}) {
    const connection = await Database.beginTransaction();

    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount: amount must be greater than 0");
      }

      // Update the existing investment
      const updateSql = `
      UPDATE user_investments SET 
        invested_amount = invested_amount + ?,
        current_value = current_value + ?,
        updated_at = NOW()
      WHERE id = ?
    `;

      await connection.execute(updateSql, [amount, amount, id]);

      // Prepare source details
      let sourceDetails = transactionData.source_details || {
        description: "Additional investment",
        investment_id: id,
        additional_amount: amount,
      };
      if (typeof sourceDetails === "string") {
        sourceDetails = { description: sourceDetails };
      }

      // Create transaction using the SAME connection
      const Transaction = require("./Transaction");

      const transaction = new Transaction({
        user_id: this.user_id,
        transaction_type: "invest",
        amount: amount,
        fee_amount: transactionData.fee_amount || 0,
        net_amount: amount - (transactionData.fee_amount || 0),
        currency: transactionData.currency || "USD",
        status: transactionData.status || "completed",
        related_user_id: transactionData.related_user_id || null,
        related_investment_id: id,
        source_type: transactionData.source_type || "internal",
        source_details: JSON.stringify(sourceDetails),
        processed_by: transactionData.processed_by || null,
        processed_at: transactionData.processed_at || new Date(),
        admin_notes: transactionData.admin_notes || null,
      });

      // CRITICAL FIX: Pass the connection to the transaction create method
      try {
        await transaction.create(connection);
      } catch (transactionError) {
        console.error("Transaction creation error:", transactionError);
        throw new Error(
          `Failed to create transaction: ${transactionError.message}`
        );
      }

      // Refresh investment data
      const refreshSql = `SELECT * FROM user_investments WHERE id = ?`;
      const [investmentRows] = await connection.execute(refreshSql, [id]);

      if (investmentRows.length > 0) {
        Object.assign(this, investmentRows[0]);
      }

      await connection.commit();
      connection.release();

      return {
        success: true,
        investment: this,
        transaction_id: transaction.id,
        message: "Additional investment added successfully",
      };
    } catch (error) {
      console.error("Additional investment error:", error);
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Find investment by ID
  static async findById(id) {
    const sql = `
      SELECT i.*, 
             u.username, u.email,
             p.name as plan_name, p.daily_roi_percentage, p.duration_days
      FROM user_investments i 
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN investment_plans p ON i.plan_id = p.id
      WHERE i.id = ?
    `;
    const result = await Database.query(sql, [id]);
    return result.length > 0 ? new UserInvestment(result[0]) : null;
  }

  // Find investments by user ID
  static async findByUserId(userId, status = null) {
    let sql = `
    SELECT 
      i.*, 
      p.name AS plan_name, 
      p.daily_roi_percentage, 
      p.duration_days,
      u.username, 
      u.email
    FROM user_investments i
    LEFT JOIN investment_plans p ON i.plan_id = p.id
    LEFT JOIN users u ON i.user_id = u.id
    WHERE i.user_id = ?
  `;

    const params = [userId];

    if (status) {
      sql += " AND i.status = ?";
      params.push(status);
    }

    sql += " ORDER BY i.created_at DESC";

    const result = await Database.query(sql, params);
    return result;
  }

  // Find investments by plan ID
  static async findByPlanId(planId, status = null) {
    let sql = `
      SELECT i.*, 
             u.username, u.email
      FROM user_investments i 
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.plan_id = ?
    `;

    const params = [planId];

    if (status) {
      sql += " AND i.status = ?";
      params.push(status);
    }

    sql += " ORDER BY i.created_at DESC";

    const result = await Database.query(sql, params);
    return result.map((row) => new UserInvestment(row));
  }

  // Get all investments with pagination and filters
  static async getAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let sql = `
      SELECT i.*, 
             u.username, u.email,
             p.name as plan_name, p.roi_percentage, p.duration_days
      FROM user_investments i 
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN investment_plans p ON i.plan_id = p.id
    `;

    let countSql = `
      SELECT COUNT(*) as total 
      FROM user_investments i 
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN investment_plans p ON i.plan_id = p.id
    `;

    const whereConditions = [];
    const params = [];

    // Apply filters
    if (filters.user_id) {
      whereConditions.push("i.user_id = ?");
      params.push(filters.user_id);
    }

    if (filters.plan_id) {
      whereConditions.push("i.plan_id = ?");
      params.push(filters.plan_id);
    }

    if (filters.status) {
      whereConditions.push("i.status = ?");
      params.push(filters.status);
    }

    if (filters.search) {
      whereConditions.push(
        "(u.username LIKE ? OR u.email LIKE ? OR p.name LIKE ?)"
      );
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    if (filters.start_date && filters.end_date) {
      whereConditions.push("i.start_date BETWEEN ? AND ?");
      params.push(filters.start_date, filters.end_date);
    }

    if (whereConditions.length > 0) {
      const whereClause = " WHERE " + whereConditions.join(" AND ");
      sql += whereClause;
      countSql += whereClause;
    }

    sql += " ORDER BY i.created_at DESC LIMIT ? OFFSET ?";
    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const [investments, countResult] = await Promise.all([
      Database.query(sql, finalParams),
      Database.query(countSql, params),
    ]);

    return {
      investments: investments.map((row) => new UserInvestment(row)),
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  }

  // Update investment
  async update() {
    const sql = `
      UPDATE user_investments SET 
        invested_amount = ?, current_value = ?, total_earned = ?,
        status = ?, start_date = ?, end_date = ?,
        last_roi_date = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const params = [
      this.invested_amount,
      this.current_value,
      this.total_earned,
      this.status,
      this.start_date,
      this.end_date,
      this.last_roi_date,
      this.id,
    ];

    await Database.query(sql, params);
    return this;
  }

  // Update ROI for investment
  async updateROI(roiAmount, newCurrentValue, transactionData = {}) {
    const connection = await Database.beginTransaction();

    try {
      // Update investment with new ROI
      const updateSql = `
        UPDATE user_investments SET 
          current_value = ?, 
          total_earned = total_earned + ?,
          last_roi_date = CURDATE(),
          updated_at = NOW()
        WHERE id = ?
      `;

      await connection.execute(updateSql, [
        newCurrentValue,
        roiAmount,
        this.id,
      ]);

      // Create ROI transaction record
      const Transaction = require("./Transaction");

      let sourceDetails = transactionData.source_details || {
        description: `ROI credited for investment ID: ${this.id}`,
        investment_id: this.id,
        roi_amount: roiAmount,
      };

      if (typeof sourceDetails === "string") {
        sourceDetails = { description: sourceDetails };
      }

      const transactionSql = `
        INSERT INTO transactions (
          user_id, transaction_type, amount, fee_amount, net_amount,
          currency, status, related_investment_id, source_type,
          source_details, processed_by, processed_at, admin_notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const transactionParams = [
        this.user_id,
        "roi_credit",
        roiAmount,
        transactionData.fee_amount || 0,
        roiAmount,
        transactionData.currency || "USD",
        "completed",
        this.id,
        "investment",
        JSON.stringify(sourceDetails),
        transactionData.processed_by || null,
        new Date(),
        transactionData.admin_notes || null,
      ];

      const transactionResult = await connection.execute(
        transactionSql,
        transactionParams
      );

      // Refresh investment data
      const refreshSql = `SELECT * FROM user_investments WHERE id = ?`;
      const [investmentRows] = await connection.execute(refreshSql, [this.id]);

      if (investmentRows.length > 0) {
        Object.assign(this, investmentRows[0]);
      }

      await connection.commit();
      connection.release();

      return {
        investment: this,
        transaction_id: transactionResult.insertId,
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  // Update investment status
  async updateStatus(newStatus, adminNotes = null) {
    const validStatuses = ["active", "completed", "cancelled", "paused"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    const sql = `
      UPDATE user_investments SET 
        status = ?, 
        updated_at = NOW()
      WHERE id = ?
    `;

    await Database.query(sql, [newStatus, this.id]);
    this.status = newStatus;

    // Create status change transaction record if needed
    if (adminNotes) {
      const Transaction = require("./Transaction");

      const transactionSql = `
        INSERT INTO transactions (
          user_id, transaction_type, amount, currency, status,
          related_investment_id, source_type, source_details,
          admin_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const sourceDetails = {
        description: `Investment status changed to: ${newStatus}`,
        investment_id: this.id,
        old_status: this.status,
        new_status: newStatus,
      };

      await Database.query(transactionSql, [
        this.user_id,
        "status_change",
        0,
        "USD",
        "completed",
        this.id,
        "internal",
        JSON.stringify(sourceDetails),
        adminNotes,
      ]);
    }

    return this;
  }

  // Get user investment summary
  static async getUserSummary(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_investments,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_investments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_investments,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_investments,
        COALESCE(SUM(invested_amount), 0) as total_invested,
        COALESCE(SUM(current_value), 0) as total_current_value,
        COALESCE(SUM(total_earned), 0) as total_earned,
        COALESCE(AVG(total_earned / invested_amount * 100), 0) as avg_roi_percentage
      FROM user_investments 
      WHERE user_id = ?
    `;

    const result = await Database.query(sql, [userId]);
    return result[0] || {};
  }

  // Get investment statistics
  static async getStats(filters = {}) {
    let sql = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(invested_amount), 0) as total_invested,
        COALESCE(SUM(current_value), 0) as total_current_value,
        COALESCE(SUM(total_earned), 0) as total_earned
      FROM user_investments
    `;

    const params = [];
    const whereConditions = [];

    if (filters.user_id) {
      whereConditions.push("user_id = ?");
      params.push(filters.user_id);
    }

    if (filters.plan_id) {
      whereConditions.push("plan_id = ?");
      params.push(filters.plan_id);
    }

    if (whereConditions.length > 0) {
      sql += " WHERE " + whereConditions.join(" AND ");
    }

    sql += " GROUP BY status";

    const statusStats = await Database.query(sql, params);

    // Get overall stats
    let overallSql = `
      SELECT 
        COUNT(*) as total_investments,
        COALESCE(SUM(invested_amount), 0) as total_invested,
        COALESCE(SUM(current_value), 0) as total_current_value,
        COALESCE(SUM(total_earned), 0) as total_earned
      FROM user_investments
    `;

    if (whereConditions.length > 0) {
      overallSql += " WHERE " + whereConditions.join(" AND ");
    }

    const overallStats = await Database.query(overallSql, params);

    return {
      by_status: statusStats,
      overall: overallStats[0] || {
        total_investments: 0,
        total_invested: 0,
        total_current_value: 0,
        total_earned: 0,
      },
    };
  }

  // Get investments due for ROI
  static async getDueForROI(date = null) {
    const checkDate = date || new Date().toISOString().split("T")[0];

    const sql = `
      SELECT i.*, 
             u.username, u.email,
             p.name as plan_name, p.roi_percentage, p.duration_days
      FROM user_investments i 
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN investment_plans p ON i.plan_id = p.id
      WHERE i.status = 'active' 
        AND (i.last_roi_date IS NULL OR i.last_roi_date < ?)
        AND i.start_date <= ?
        AND i.end_date >= ?
      ORDER BY i.start_date ASC
    `;

    const result = await Database.query(sql, [checkDate, checkDate, checkDate]);
    return result.map((row) => new UserInvestment(row));
  }

  // Delete investment
  async delete() {
    const sql = "DELETE FROM user_investments WHERE id = ?";
    await Database.query(sql, [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      plan_id: this.plan_id,
      invested_amount: parseFloat(this.invested_amount),
      current_value: parseFloat(this.current_value),
      total_earned: parseFloat(this.total_earned),
      status: this.status,
      start_date: this.start_date,
      end_date: this.end_date,
      last_roi_date: this.last_roi_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Include related data if available
      username: this.username || null,
      email: this.email || null,
      plan_name: this.plan_name || null,
      roi_percentage: this.roi_percentage || null,
      duration_days: this.duration_days || null,
    };
  }
}

module.exports = UserInvestment;
