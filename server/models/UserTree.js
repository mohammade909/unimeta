const database = require('../database'); // Adjust path as needed

class UserTree {
  constructor() {
    this.tableName = 'user_mlm_tree';
  }

  // Get user's position in MLM tree
  async getUserTreePosition(userId) {
    try {
      const sql = `
        SELECT 
          umt.*,
          u.username,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status,
          parent_user.username as parent_name,
          parent_user.email as parent_email
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        LEFT JOIN users parent_user ON umt.parent_id = parent_user.id
        WHERE umt.user_id = ?
      `;
      
      const results = await database.query(sql, [userId]);
      return results[0] || null;
    } catch (error) {
      console.error('Error getting user tree position:', error);
      throw error;
    }
  }

  // Get all direct children of a user
  async getDirectChildren(userId) {
    try {
      const sql = `
        SELECT 
          umt.*,
          u.username,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status,
          u.created_at as user_joined_date
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.parent_id = ?
        ORDER BY umt.created_at ASC
      `;
      
      const results = await database.query(sql, [userId]);
      return results;
    } catch (error) {
      console.error('Error getting direct children:', error);
      throw error;
    }
  }

  // Get complete tree structure under a user (with depth limit)
  async getCompleteTree(userId, maxDepth = 5) {
    try {
      const sql = `
        SELECT 
          umt.*,
          u.username,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status,
          u.created_at as user_joined_date
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.path LIKE ? AND umt.level <= ?
        ORDER BY umt.level ASC, umt.created_at ASC
      `;
      
      const pathPattern = `%/${userId}/%`;
      const results = await database.query(sql, [pathPattern, maxDepth]);
      
      return this.buildTreeStructure(results, userId);
    } catch (error) {
      console.error('Error getting complete tree:', error);
      throw error;
    }
  }

  // Get tree by levels (level-wise structure)
  async getTreeByLevels(userId, startLevel = 1, endLevel = 5) {
    try {
      const sql = `
        SELECT 
          umt.*,
          u.username,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status,
          u.created_at as user_joined_date
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.path LIKE ? AND umt.level BETWEEN ? AND ?
        ORDER BY umt.level ASC, umt.created_at ASC
      `;
      
      const pathPattern = `%/${userId}/%`;
      const results = await database.query(sql, [pathPattern, startLevel, endLevel]);
      
      // Group by levels
      const levelGroups = {};
      results.forEach(user => {
        if (!levelGroups[user.level]) {
          levelGroups[user.level] = [];
        }
        levelGroups[user.level].push(user);
      });
      
      return levelGroups;
    } catch (error) {
      console.error('Error getting tree by levels:', error);
      throw error;
    }
  }

  // Get team statistics for a user
  async getTeamStatistics(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_team_members,
          COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_team_members,
          SUM(umt.team_business) as total_team_business,
          MAX(umt.level) as max_depth,
          AVG(umt.level) as avg_depth
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.path LIKE ?
      `;
      
      const pathPattern = `%/${userId}/%`;
      const results = await database.query(sql, [pathPattern]);
      
      return results[0] || {
        total_team_members: 0,
        active_team_members: 0,
        total_team_business: 0,
        max_depth: 0,
        avg_depth: 0
      };
    } catch (error) {
      console.error('Error getting team statistics:', error);
      throw error;
    }
  }

  // Get genealogy report (upline and downline)
  async getGenealogyReport(userId) {
    try {
      // Get user's position
      const userPosition = await this.getUserTreePosition(userId);
      if (!userPosition) {
        throw new Error('User not found in MLM tree');
      }

      // Get upline (sponsors)
      const uplineIds = userPosition.path.split('/').filter(id => id && id !== userId.toString());
      const upline = [];
      
      for (const uplineId of uplineIds) {
        const uplineUser = await this.getUserTreePosition(parseInt(uplineId));
        if (uplineUser) {
          upline.push(uplineUser);
        }
      }

      // Get downline (team)
      const downline = await this.getCompleteTree(userId);

      // Get statistics
      const statistics = await this.getTeamStatistics(userId);

      return {
        user: userPosition,
        upline: upline,
        downline: downline,
        statistics: statistics
      };
    } catch (error) {
      console.error('Error getting genealogy report:', error);
      throw error;
    }
  }

  // Add new user to MLM tree
  async addUserToTree(userId, parentId = null) {
    const connection = await database.beginTransaction();
    
    try {
      let level = 1;
      let path = `/${userId}/`;
      
      if (parentId) {
        // Get parent info
        const parentInfo = await this.getUserTreePosition(parentId);
        if (!parentInfo) {
          throw new Error('Parent user not found in MLM tree');
        }
        
        level = parentInfo.level + 1;
        path = `${parentInfo.path}${userId}/`;
        
        // Update parent's direct referrals count
        await connection.execute(
          `UPDATE ${this.tableName} SET direct_referrals = direct_referrals + 1 WHERE user_id = ?`,
          [parentId]
        );
      }
      
      // Insert new user
      const insertSql = `
        INSERT INTO ${this.tableName} (user_id, parent_id, level, path, direct_referrals, total_team_size, active_team_size, team_business)
        VALUES (?, ?, ?, ?, 0, 0, 0, 0.00)
      `;
      
      await connection.execute(insertSql, [userId, parentId, level, path]);
      
      // Update team sizes for all upline users
      if (parentId) {
        await this.updateUplineTeamSizes(parentId, connection);
      }
      
      await database.commitTransaction(connection);
      
      return await this.getUserTreePosition(userId);
    } catch (error) {
      await database.rollbackTransaction(connection);
      console.error('Error adding user to tree:', error);
      throw error;
    }
  }

  // Update team sizes for upline users
  async updateUplineTeamSizes(userId, connection = null) {
    try {
      const useConnection = connection || database;
      
      const userPosition = await this.getUserTreePosition(userId);
      if (!userPosition) return;
      
      const uplineIds = userPosition.path.split('/').filter(id => id && id !== userId.toString());
      
      for (const uplineId of uplineIds) {
        const sql = `
          UPDATE ${this.tableName} 
          SET total_team_size = (
            SELECT COUNT(*) 
            FROM ${this.tableName} sub 
            WHERE sub.path LIKE CONCAT('%/', ?, '/%') AND sub.user_id != ?
          ),
          active_team_size = (
            SELECT COUNT(*) 
            FROM ${this.tableName} sub 
            LEFT JOIN users u ON sub.user_id = u.id
            WHERE sub.path LIKE CONCAT('%/', ?, '/%') AND sub.user_id != ? AND u.status = 'active'
          )
          WHERE user_id = ?
        `;
        
        await useConnection.execute(sql, [uplineId, uplineId, uplineId, uplineId, uplineId]);
      }
    } catch (error) {
      console.error('Error updating upline team sizes:', error);
      throw error;
    }
  }

  // Update business volume for a user and upline
  async updateBusinessVolume(userId, amount) {
    const connection = await database.beginTransaction();
    
    try {
      const userPosition = await this.getUserTreePosition(userId);
      if (!userPosition) {
        throw new Error('User not found in MLM tree');
      }
      
      // Update user's business
      await connection.execute(
        `UPDATE ${this.tableName} SET team_business = team_business + ? WHERE user_id = ?`,
        [amount, userId]
      );
      
      // Update upline business
      const uplineIds = userPosition.path.split('/').filter(id => id && id !== userId.toString());
      
      for (const uplineId of uplineIds) {
        await connection.execute(
          `UPDATE ${this.tableName} SET team_business = team_business + ? WHERE user_id = ?`,
          [amount, uplineId]
        );
      }
      
      await database.commitTransaction(connection);
      
      return true;
    } catch (error) {
      await database.rollbackTransaction(connection);
      console.error('Error updating business volume:', error);
      throw error;
    }
  }

  // Helper method to build tree structure
  buildTreeStructure(flatArray, rootId = null) {
    const tree = [];
    const lookup = {};
    
    // Create lookup table
    flatArray.forEach(node => {
      lookup[node.user_id] = { ...node, children: [] };
    });
    
    // Build tree
    flatArray.forEach(node => {
      if (node.parent_id && lookup[node.parent_id]) {
        lookup[node.parent_id].children.push(lookup[node.user_id]);
      } else if (!rootId || node.user_id === rootId) {
        tree.push(lookup[node.user_id]);
      }
    });
    
    return tree;
  }

  // Search users in tree
  async searchUsersInTree(parentUserId, searchTerm, limit = 50) {
    try {
      const sql = `
        SELECT 
          umt.*,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          u.status as user_status
        FROM ${this.tableName} umt
        LEFT JOIN users u ON umt.user_id = u.id
        WHERE umt.path LIKE ? 
        AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)
        ORDER BY umt.level ASC, umt.created_at ASC
        LIMIT ?
      `;
      
      const pathPattern = `%/${parentUserId}/%`;
      const searchPattern = `%${searchTerm}%`;
      
      const results = await database.query(sql, [
        pathPattern, 
        searchPattern, 
        searchPattern, 
        searchPattern, 
        limit
      ]);
      
      return results;
    } catch (error) {
      console.error('Error searching users in tree:', error);
      throw error;
    }
  }
}

module.exports = new UserTree();