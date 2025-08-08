const UserTree = require('../models/UserTree');

class UserTreeController {
  
  // Get user's MLM tree position and basic info
  async getUserTreePosition(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const userPosition = await UserTree.getUserTreePosition(parseInt(userId));
      
      if (!userPosition) {
        return res.status(404).json({
          success: false,
          message: 'User not found in MLM tree'
        });
      }
      
      res.json({
        success: true,
        data: userPosition
      });
      
    } catch (error) {
      console.error('Error getting user tree position:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get direct children/referrals of a user
  async getDirectChildren(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const children = await UserTree.getDirectChildren(parseInt(userId));
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedChildren = children.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          children: paginatedChildren,
          pagination: {
            currentPage: parseInt(page),
            totalItems: children.length,
            itemsPerPage: parseInt(limit),
            totalPages: Math.ceil(children.length / limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Error getting direct children:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get complete tree structure under a user
  async getCompleteTree(req, res) {
    try {
      const { userId } = req.params;
      const { maxDepth = 10 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const tree = await UserTree.getCompleteTree(parseInt(userId), parseInt(maxDepth));
      
      res.json({
        success: true,
        data: {
          tree: tree,
          maxDepth: parseInt(maxDepth)
        }
      });
      
    } catch (error) {
      console.error('Error getting complete tree:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get tree organized by levels
  async getTreeByLevels(req, res) {
    try {
      const { userId } = req.params;
      const { startLevel = 1, endLevel = 5 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const levelGroups = await UserTree.getTreeByLevels(
        parseInt(userId), 
        parseInt(startLevel), 
        parseInt(endLevel)
      );
      
      res.json({
        success: true,
        data: {
          levels: levelGroups,
          startLevel: parseInt(startLevel),
          endLevel: parseInt(endLevel)
        }
      });
      
    } catch (error) {
      console.error('Error getting tree by levels:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get team statistics for a user
  async getTeamStatistics(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const statistics = await UserTree.getTeamStatistics(parseInt(userId));
      
      res.json({
        success: true,
        data: statistics
      });
      
    } catch (error) {
      console.error('Error getting team statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get complete genealogy report (upline and downline)
  async getGenealogyReport(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const report = await UserTree.getGenealogyReport(parseInt(userId));
      
      res.json({
        success: true,
        data: report
      });
      
    } catch (error) {
      console.error('Error getting genealogy report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Add new user to MLM tree
  async addUserToTree(req, res) {
    try {
      const { userId, parentId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await UserTree.addUserToTree(parseInt(userId), parentId ? parseInt(parentId) : null);
      
      res.status(201).json({
        success: true,
        message: 'User added to MLM tree successfully',
        data: result
      });
      
    } catch (error) {
      console.error('Error adding user to tree:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update business volume for a user
  async updateBusinessVolume(req, res) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'User ID and amount are required'
        });
      }
      
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      
      await UserTree.updateBusinessVolume(parseInt(userId), parseFloat(amount));
      
      res.json({
        success: true,
        message: 'Business volume updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating business volume:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Search users in tree
  async searchUsersInTree(req, res) {
    try {
      const { userId } = req.params;
      const { search, limit = 50 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      if (!search || search.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters long'
        });
      }
      
      const results = await UserTree.searchUsersInTree(
        parseInt(userId), 
        search.trim(), 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: {
          results: results,
          searchTerm: search.trim(),
          totalFound: results.length
        }
      });
      
    } catch (error) {
      console.error('Error searching users in tree:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get MLM dashboard data for a user
  async getDashboardData(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const [
        userPosition,
        directChildren,
        teamStats,
        levelGroups
      ] = await Promise.all([
        UserTree.getUserTreePosition(parseInt(userId)),
        UserTree.getDirectChildren(parseInt(userId)),
        UserTree.getTeamStatistics(parseInt(userId)),
        UserTree.getTreeByLevels(parseInt(userId), 1, 3)
      ]);
      
      res.json({
        success: true,
        data: {
          userPosition: userPosition,
          directChildren: directChildren.slice(0, 10), // Show only first 10
          teamStatistics: teamStats,
          levelGroups: levelGroups,
          summary: {
            totalDirectReferrals: directChildren.length,
            totalTeamSize: teamStats.total_team_members,
            activeTeamSize: teamStats.active_team_members,
            teamBusiness: teamStats.total_team_business,
            maxDepth: teamStats.max_depth
          }
        }
      });
      
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get team performance report
  async getTeamPerformanceReport(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      // Get basic team data
      const [teamStats, directChildren] = await Promise.all([
        UserTree.getTeamStatistics(parseInt(userId)),
        UserTree.getDirectChildren(parseInt(userId))
      ]);
      
      // Calculate performance metrics
      const performanceData = {
        overview: {
          totalTeamMembers: teamStats.total_team_members,
          activeTeamMembers: teamStats.active_team_members,
          inactiveTeamMembers: teamStats.total_team_members - teamStats.active_team_members,
          totalBusiness: teamStats.total_team_business,
          averageBusinessPerMember: teamStats.total_team_members > 0 ? 
            (teamStats.total_team_business / teamStats.total_team_members).toFixed(2) : 0
        },
        directReferrals: {
          total: directChildren.length,
          active: directChildren.filter(child => child.user_status === 'active').length,
          inactive: directChildren.filter(child => child.user_status !== 'active').length
        },
        teamDepth: {
          maxDepth: teamStats.max_depth,
          averageDepth: parseFloat(teamStats.avg_depth).toFixed(2)
        }
      };
      
      res.json({
        success: true,
        data: performanceData
      });
      
    } catch (error) {
      console.error('Error getting team performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new UserTreeController();