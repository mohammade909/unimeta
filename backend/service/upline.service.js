// services/UplineRewardService.js
const Database = require("../database");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

class UplineRewardService {
  constructor() {
    this.rewardLevels = [
      { level: 1, percentage: 5, minChildren: 15, name: "Direct Level" },
      { level: 2, percentage: 2, minChildren: 15, name: "Second Level" },
      { level: 3, percentage: 1, minChildren: 15, name: "Third Level" }
    ];
    this.maxLevels = 3; // Make this adjustable
  }

  /**
   * Set the maximum levels to traverse (adjustable)
   * @param {number} levels - Number of levels to traverse
   */
  setMaxLevels(levels) {
    this.maxLevels = levels;
    // Adjust reward levels array if needed
    if (levels > this.rewardLevels.length) {
      for (let i = this.rewardLevels.length + 1; i <= levels; i++) {
        this.rewardLevels.push({
          level: i,
          percentage: Math.max(1, 6 - i), // Decreasing percentage
          minChildren: 15,
          name: `Level ${i}`
        });
      }
    }
  }

  async distributeUplineRewards(userId, amount, sourceType = 'upline_reward', sourceDetails = null) {
    const connection = await Database.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = {
        success: true,
        totalDistributed: 0,
        rewardsDistributed: [],
        errors: [],
        processedLevels: 0
      };

      // Get all qualified children across all levels
      const qualifiedChildren = await this.getQualifiedChildrenByLevels(userId, this.maxLevels);

      // Process each level
      for (let level = 1; level <= this.maxLevels; level++) {
        const levelConfig = this.rewardLevels.find(l => l.level === level);
        if (!levelConfig) continue;

        const childrenAtLevel = qualifiedChildren[level] || [];
        
        console.log(`Processing Level ${level}: Found ${childrenAtLevel.length} qualified children`);

        for (const child of childrenAtLevel) {
          try {
            const rewardAmount = (amount * levelConfig.percentage) / 100;
            
            // Create transaction for the reward
            const transactionResult = await this.createRewardTransaction(
              connection,
              child.userId,
              rewardAmount,
              levelConfig,
              sourceType,
              sourceDetails,
              userId // Original user who triggered the reward
            );

            if (transactionResult.success) {
              results.rewardsDistributed.push({
                level: level,
                userId: child.userId,
                username: child.username,
                amount: rewardAmount,
                percentage: levelConfig.percentage,
                childrenCount: child.directChildrenCount,
                transactionId: transactionResult.transaction.id
              });
              
              results.totalDistributed += rewardAmount;
              console.log(`Level ${level} reward of $${rewardAmount} distributed to user ${child.userId} (${child.username})`);
            } else {
              results.errors.push({
                level: level,
                userId: child.userId,
                error: transactionResult.message
              });
            }
          } catch (levelError) {
            console.error(`Error processing level ${level} for user ${child.userId}:`, levelError);
            results.errors.push({
              level: level,
              userId: child.userId,
              error: levelError.message
            });
          }
        }

        results.processedLevels++;
      }

      await connection.commit();
      
      return {
        ...results,
        message: `Upline rewards distribution completed. Total distributed: $${results.totalDistributed.toFixed(2)}`
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error in distributeUplineRewards:', error);
      
      return {
        success: false,
        error: error.message,
        totalDistributed: 0,
        rewardsDistributed: [],
        errors: [{ general: error.message }]
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Get all qualified children by levels (children who have 15+ direct referrals)
   * @param {number} userId - Starting user ID
   * @param {number} maxLevels - Maximum levels to traverse
   * @returns {Object} - Object with level as key and array of qualified children as value
   */
  async getQualifiedChildrenByLevels(userId, maxLevels = 3) {
    try {
      const qualifiedByLevel = {};
      
      // Initialize each level
      for (let i = 1; i <= maxLevels; i++) {
        qualifiedByLevel[i] = [];
      }

      // Start BFS traversal to find children at each level
      const queue = [{ userId: userId, level: 0 }]; // Start from level 0 (root user)
      const visited = new Set([userId]);

      while (queue.length > 0) {
        const { userId: currentUserId, level: currentLevel } = queue.shift();
        
        // If we've reached the maximum level, stop
        if (currentLevel >= maxLevels) continue;

        // Get direct children of current user
        const directChildren = await this.getDirectChildren(currentUserId);
        
        for (const child of directChildren) {
          if (visited.has(child.id)) continue; // Prevent cycles
          visited.add(child.id);

          const childLevel = currentLevel + 1;
          
          // Count this child's direct referrals
          const directChildrenCount = await this.getDirectChildrenCount(child.id);
          
          // If child has 15+ direct referrals, they qualify for rewards
          if (directChildrenCount >= 15) {
            qualifiedByLevel[childLevel].push({
              userId: child.id,
              username: child.username,
              email: child.email,
              level: childLevel,
              directChildrenCount: directChildrenCount,
              parentId: currentUserId
            });
            
            console.log(`Found qualified child at level ${childLevel}: User ${child.id} (${child.username}) with ${directChildrenCount} direct children`);
          }
          
          // Add to queue for further traversal (regardless of qualification)
          if (childLevel < maxLevels) {
            queue.push({ userId: child.id, level: childLevel });
          }
        }
      }

      return qualifiedByLevel;
    } catch (error) {
      console.error('Error getting qualified children by levels:', error);
      return {};
    }
  }

  /**
   * Get direct children of a user
   * @param {number} userId - User ID to get children for
   * @returns {Array} - Array of direct children
   */
  async getDirectChildren(userId) {
    try {
      const sql = `
        SELECT id, username, email, status
        FROM users 
        WHERE referrer_id = ? AND status = 'active'
        ORDER BY created_at ASC
      `;
      
      const results = await Database.query(sql, [userId]);
      return results || [];
    } catch (error) {
      console.error(`Error getting direct children for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Count direct children (referrals) for a user
   * @param {number} userId - User ID to count children for
   * @returns {number} - Number of direct children
   */
  async getDirectChildrenCount(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as children_count 
        FROM users 
        WHERE referrer_id = ? AND status = 'active'
      `;
      
      const results = await Database.query(sql, [userId]);
      return results[0]?.children_count || 0;
    } catch (error) {
      console.error(`Error counting direct children for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Create reward transaction
   * @param {Object} connection - Database connection
   * @param {number} userId - User receiving the reward
   * @param {number} amount - Reward amount
   * @param {Object} levelConfig - Level configuration
   * @param {string} sourceType - Source type
   * @param {string} sourceDetails - Source details
   * @param {number} originalUserId - User who triggered the reward
   * @returns {Object} - Transaction creation result
   */
  async createRewardTransaction(connection, userId, amount, levelConfig, sourceType, sourceDetails, originalUserId) {
    try {
      // Validate inputs to prevent constraint violations
      if (!userId || userId <= 0) {
        throw new Error('Invalid user_id provided');
      }
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount provided - must be positive');
      }

      // Ensure all numeric values are properly formatted
      const formattedAmount = parseFloat(amount.toFixed(2));
      const formattedFeeAmount = 0.00;
      const formattedNetAmount = parseFloat(formattedAmount.toFixed(2));

      // Use the correct transaction type from the enum
      const transactionType = 'upline_commission';

      // Use the correct status from the enum
      const status = 'completed';

      // Use the correct currency
      const currency = 'USD';

      // Use the correct source type from the enum
      const validatedSourceType = 'internal';

      // Create proper JSON for source_details to satisfy the constraint
      const sourceDetailsJson = JSON.stringify({
        type: sourceType || 'upline_reward',
        level: levelConfig.level,
        level_name: levelConfig.name,
        percentage: levelConfig.percentage,
        min_children_required: levelConfig.minChildren,
        description: `${levelConfig.name} reward (${levelConfig.percentage}% commission)`,
        original_user_id: originalUserId,
        triggered_by: 'system',
        additional_details: sourceDetails || null
      });

      const transaction = new Transaction({
        user_id: parseInt(userId),
        transaction_type: transactionType,
        amount: formattedAmount,
        fee_amount: formattedFeeAmount,
        net_amount: formattedNetAmount,
        currency: currency,
        status: status,
        related_user_id: originalUserId ? parseInt(originalUserId) : null,
        related_investment_id: null, // Explicitly set to null for commission transactions
        source_type: validatedSourceType,
        source_details: sourceDetailsJson, // Now properly formatted as JSON
        processed_by: null, // Let it be null for system-generated transactions
        processed_at: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL datetime format
        admin_notes: `Level ${levelConfig.level} downline reward: ${levelConfig.percentage}% commission for ${levelConfig.minChildren}+ direct referrals`
      });

      // Log the transaction data for debugging
      console.log('Creating transaction with data:', {
        user_id: transaction.user_id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        status: transaction.status,
        source_type: transaction.source_type,
        source_details_preview: sourceDetailsJson.substring(0, 100) + '...'
      });

      const result = await transaction.create(connection);
      
      return {
        success: true,
        transaction: result,
        message: `Level ${levelConfig.level} reward transaction created successfully`
      };

    } catch (error) {
      console.error(`Error creating reward transaction for user ${userId}:`, error);
      console.error('Transaction data that failed:', {
        user_id: userId,
        amount: amount,
        levelConfig: levelConfig,
        error_code: error.code,
        error_message: error.message
      });
      
      return {
        success: false,
        transaction: null,
        message: error.message,
        originalAmount: amount,
        actualAmount: 0
      };
    }
  }

  /**
   * Get the complete downline tree structure
   * @param {number} userId - Starting user ID
   * @param {number} levels - Number of levels to traverse
   * @returns {Array} - Downline tree structure
   */
  async getDownlineTree(userId, levels = 3) {
    try {
      const qualifiedChildren = await this.getQualifiedChildrenByLevels(userId, levels);
      const summary = {
        totalQualified: 0,
        levelBreakdown: {}
      };

      for (let level = 1; level <= levels; level++) {
        const childrenAtLevel = qualifiedChildren[level] || [];
        summary.levelBreakdown[level] = {
          count: childrenAtLevel.length,
          children: childrenAtLevel
        };
        summary.totalQualified += childrenAtLevel.length;
      }

      return summary;
    } catch (error) {
      console.error('Error getting downline tree:', error);
      return { totalQualified: 0, levelBreakdown: {} };
    }
  }

  /**
   * Validate if a user qualifies for upline rewards at a specific level
   * @param {number} userId - User ID to validate
   * @param {number} level - Level to validate (1, 2, or 3)
   * @returns {Object} - Validation result
   */
  async validateUserForLevel(userId, level) {
    try {
      const levelConfig = this.rewardLevels.find(l => l.level === level);
      if (!levelConfig) {
        return { valid: false, message: 'Invalid level specified' };
      }

      const user = await User.findById(userId);
      if (!user) {
        return { valid: false, message: 'User not found' };
      }

      const directChildrenCount = await this.getDirectChildrenCount(userId);
      const qualifies = directChildrenCount >= levelConfig.minChildren;

      return {
        valid: qualifies,
        userId: userId,
        level: level,
        directChildren: directChildrenCount,
        requiredChildren: levelConfig.minChildren,
        rewardPercentage: levelConfig.percentage,
        message: qualifies 
          ? `User qualifies for level ${level} rewards`
          : `User needs ${levelConfig.minChildren - directChildrenCount} more direct referrals`
      };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  /**
   * Get statistics for reward distribution
   * @param {number} userId - Starting user ID
   * @returns {Object} - Distribution statistics
   */
  async getRewardDistributionStats(userId) {
    try {
      const downlineTree = await this.getDownlineTree(userId, this.maxLevels);
      const stats = {
        userId: userId,
        maxLevels: this.maxLevels,
        totalQualifiedChildren: downlineTree.totalQualified,
        levelStats: {}
      };

      for (let level = 1; level <= this.maxLevels; level++) {
        const levelConfig = this.rewardLevels.find(l => l.level === level);
        const levelData = downlineTree.levelBreakdown[level];
        
        stats.levelStats[level] = {
          qualifiedCount: levelData ? levelData.count : 0,
          rewardPercentage: levelConfig ? levelConfig.percentage : 0,
          minRequiredChildren: levelConfig ? levelConfig.minChildren : 15
        };
      }

      return stats;
    } catch (error) {
      console.error('Error getting reward distribution stats:', error);
      return null;
    }
  }

  /**
   * Debug method to check transaction constraints
   * @returns {Object} - Constraint information
   */
  async getTransactionConstraints() {
    try {
      const constraintSql = `
        SELECT 
          CONSTRAINT_NAME,
          CHECK_CLAUSE
        FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions'
      `;
      
      const constraints = await Database.query(constraintSql);
      
      const columnSql = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions'
        ORDER BY ORDINAL_POSITION
      `;
      
      const columns = await Database.query(columnSql);
      
      return {
        constraints: constraints || [],
        columns: columns || []
      };
    } catch (error) {
      console.error('Error getting transaction constraints:', error);
      return { constraints: [], columns: [] };
    }
  }

  /**
   * Test transaction creation with minimal data
   * @param {number} userId - User ID to test with
   * @param {number} amount - Amount to test with
   * @returns {Object} - Test result
   */
  async testTransactionCreation(userId, amount = 1.00) {
    const connection = await Database.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create proper JSON for source_details
      const sourceDetailsJson = JSON.stringify({
        type: 'test_transaction',
        description: 'Test transaction for debugging',
        created_by: 'system_test'
      });

      // Test with minimal required data
      const testTransaction = new Transaction({
        user_id: parseInt(userId),
        transaction_type: 'upline_commission',
        amount: parseFloat(amount.toFixed(2)),
        fee_amount: 0.00,
        net_amount: parseFloat(amount.toFixed(2)),
        currency: 'USD',
        status: 'completed',
        source_type: 'internal',
        source_details: sourceDetailsJson, // Valid JSON
        admin_notes: 'Test transaction for debugging'
      });

      console.log('Testing transaction with data:', {
        user_id: testTransaction.user_id,
        transaction_type: testTransaction.transaction_type,
        amount: testTransaction.amount,
        status: testTransaction.status,
        source_details_valid: this.isValidJson(sourceDetailsJson)
      });

      const result = await testTransaction.create(connection);
      
      // Rollback to avoid creating actual test data
      await connection.rollback();
      
      return {
        success: true,
        message: 'Test transaction creation successful',
        transaction: result
      };
      
    } catch (error) {
      await connection.rollback();
      
      return {
        success: false,
        message: error.message,
        error: error
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Helper method to validate JSON
   * @param {string} str - String to validate
   * @returns {boolean} - True if valid JSON
   */
  isValidJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = UplineRewardService;