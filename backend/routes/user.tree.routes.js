const express = require('express');
const router = express.Router();
const treeController = require('../controllers/user.tree.controller');

// Middleware for input validation (optional - you can create a separate middleware file)
const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({
      success: false,
      message: 'Valid User ID is required'
    });
  }
  next();
};

// GET Routes - Tree Structure and Information

/**
 * @route   GET /api/mlm-tree/user/:userId/position
 * @desc    Get user's position in MLM tree
 * @access  Private
 */
router.get('/user/:userId/position', validateUserId, treeController.getUserTreePosition);

/**
 * @route   GET /api/mlm-tree/user/:userId/direct-children
 * @desc    Get direct children/referrals of a user
 * @access  Private
 * @query   page, limit
 */
router.get('/user/:userId/direct-children', validateUserId, treeController.getDirectChildren);

/**
 * @route   GET /api/mlm-tree/user/:userId/complete-tree
 * @desc    Get complete tree structure under a user
 * @access  Private
 * @query   maxDepth (default: 5)
 */
router.get('/user/:userId/complete-tree', validateUserId, treeController.getCompleteTree);

/**
 * @route   GET /api/mlm-tree/user/:userId/tree-by-levels
 * @desc    Get tree organized by levels
 * @access  Private
 * @query   startLevel, endLevel
 */
router.get('/user/:userId/tree-by-levels', validateUserId, treeController.getTreeByLevels);

/**
 * @route   GET /api/mlm-tree/user/:userId/team-statistics
 * @desc    Get team statistics for a user
 * @access  Private
 */
router.get('/user/:userId/team-statistics', validateUserId, treeController.getTeamStatistics);

/**
 * @route   GET /api/mlm-tree/user/:userId/genealogy-report
 * @desc    Get complete genealogy report (upline and downline)
 * @access  Private
 */
router.get('/user/:userId/genealogy-report', validateUserId, treeController.getGenealogyReport);

/**
 * @route   GET /api/mlm-tree/user/:userId/dashboard
 * @desc    Get MLM dashboard data for a user
 * @access  Private
 */
router.get('/user/:userId/dashboard', validateUserId, treeController.getDashboardData);

/**
 * @route   GET /api/mlm-tree/user/:userId/performance-report
 * @desc    Get team performance report
 * @access  Private
 * @query   startDate, endDate
 */
router.get('/user/:userId/performance-report', validateUserId, treeController.getTeamPerformanceReport);

/**
 * @route   GET /api/mlm-tree/user/:userId/search
 * @desc    Search users in tree
 * @access  Private
 * @query   search, limit
 */
router.get('/user/:userId/search', validateUserId, treeController.searchUsersInTree);

// POST Routes - Tree Management

/**
 * @route   POST /api/mlm-tree/add-user
 * @desc    Add new user to MLM tree
 * @access  Private
 * @body    { userId, parentId }
 */
router.post('/add-user', treeController.addUserToTree);

/**
 * @route   POST /api/mlm-tree/user/:userId/update-business-volume
 * @desc    Update business volume for a user
 * @access  Private
 * @body    { amount }
 */
router.post('/user/:userId/update-business-volume', validateUserId, treeController.updateBusinessVolume);

// Additional helper routes

/**
 * @route   GET /api/mlm-tree/health
 * @desc    Health check for MLM tree API
 * @access  Public
 */

/**
 * @route   GET /api/mlm-tree/user/:userId/quick-stats
 * @desc    Get quick statistics for a user (lightweight)
 * @access  Private
 */
router.get('/user/:userId/quick-stats', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    const UserMlmTree = require('../models/UserMlmTree');
    
    const [userPosition, directChildren, teamStats] = await Promise.all([
      UserMlmTree.getUserTreePosition(parseInt(userId)),
      UserMlmTree.getDirectChildren(parseInt(userId)),
      UserMlmTree.getTeamStatistics(parseInt(userId))
    ]);
    
    res.json({
      success: true,
      data: {
        level: userPosition ? userPosition.level : 0,
        directReferrals: directChildren.length,
        totalTeamSize: teamStats.total_team_members,
        activeTeamSize: teamStats.active_team_members,
        teamBusiness: teamStats.total_team_business,
        maxDepth: teamStats.max_depth
      }
    });
  } catch (error) {
    console.error('Error getting quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mlm-tree/user/:userId/upline
 * @desc    Get upline chain for a user
 * @access  Private
 */
router.get('/user/:userId/upline', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    const UserMlmTree = require('../models/UserTree');
    
    const userPosition = await UserMlmTree.getUserTreePosition(parseInt(userId));
    if (!userPosition) {
      return res.status(404).json({
        success: false,
        message: 'User not found in MLM tree'
      });
    }
    
    const uplineIds = userPosition.path.split('/').filter(id => id && id !== userId.toString());
    const upline = [];
    
    for (const uplineId of uplineIds) {
      const uplineUser = await UserMlmTree.getUserTreePosition(parseInt(uplineId));
      if (uplineUser) {
        upline.push(uplineUser);
      }
    }
    
    res.json({
      success: true,
      data: {
        upline: upline,
        totalUplineCount: upline.length
      }
    });
  } catch (error) {
    console.error('Error getting upline:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mlm-tree/user/:userId/level/:level
 * @desc    Get all users at a specific level under a user
 * @access  Private
 */
router.get('/user/:userId/level/:level', validateUserId, async (req, res) => {
  try {
    const { userId, level } = req.params;
    const UserMlmTree = require('../models/UserTree');
    
    if (!level || isNaN(parseInt(level))) {
      return res.status(400).json({
        success: false,
        message: 'Valid level is required'
      });
    }
    
    const levelGroups = await UserMlmTree.getTreeByLevels(
      parseInt(userId), 
      parseInt(level), 
      parseInt(level)
    );
    
    const usersAtLevel = levelGroups[level] || [];
    
    res.json({
      success: true,
      data: {
        level: parseInt(level),
        users: usersAtLevel,
        count: usersAtLevel.length
      }
    });
  } catch (error) {
    console.error('Error getting users at level:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mlm-tree/user/:userId/binary-tree
 * @desc    Get binary tree structure (left and right leg)
 * @access  Private
 */
router.get('/user/:userId/binary-tree', validateUserId, async (req, res) => {
  try {
    const { userId } = req.params;
    const UserMlmTree = require('../models/UserTree');
    
    const directChildren = await UserMlmTree.getDirectChildren(parseInt(userId));
    
    // For binary MLM, typically first child is left leg, second is right leg
    const leftLeg = directChildren[0] || null;
    const rightLeg = directChildren[1] || null;
    
    let leftLegTree = null;
    let rightLegTree = null;
    
    if (leftLeg) {
      leftLegTree = await UserMlmTree.getCompleteTree(leftLeg.user_id, 3);
    }
    
    if (rightLeg) {
      rightLegTree = await UserMlmTree.getCompleteTree(rightLeg.user_id, 3);
    }
    
    res.json({
      success: true,
      data: {
        leftLeg: {
          user: leftLeg,
          tree: leftLegTree
        },
        rightLeg: {
          user: rightLeg,
          tree: rightLegTree
        }
      }
    });
  } catch (error) {
    console.error('Error getting binary tree:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});



module.exports = router;