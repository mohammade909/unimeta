const express = require('express');
const router = express.Router();
const RewardController = require('../controllers/rewards.controller'); // Adjust path as needed

// Validation middleware for reward program creation/update
const validateRewardProgram = (req, res, next) => {
  const { title, reward_type } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }
  
  const validTypes = ['achievement', 'milestone', 'monthly', 'weekly'];
  if (!reward_type || !validTypes.includes(reward_type)) {
    return res.status(400).json({
      success: false,
      message: 'Valid reward_type is required (achievement, milestone, monthly, weekly)'
    });
  }
  
  next();
};

// Middleware to validate numeric parameters
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid ID is required'
    });
  }
  next();
};

// Routes

// GET /api/reward-programs - Get all reward programs with optional filters
router.get('/', RewardController.getAllRewards);

// GET /api/reward-programs/stats - Get reward program statistics
router.get('/stats', RewardController.getRewardStats);

// GET /api/reward-programs/active - Get active reward programs
router.get('/active', RewardController.getActiveRewards);

// GET /api/reward-programs/type/:type - Get reward programs by type
router.get('/type/:type', RewardController.getRewardByType);

// GET /api/reward-programs/:id - Get specific reward program by ID
router.get('/:id', validateId, RewardController.getRewardById);

// POST /api/reward-programs - Create new reward program
router.post('/', validateRewardProgram, RewardController.createReward);

// PUT /api/reward-programs/:id - Update reward program
router.put('/:id', validateId, RewardController.updateReward);

// PATCH /api/reward-programs/:id/activate - Activate reward program
router.patch('/:id/activate', validateId, RewardController.activateReward);

// PATCH /api/reward-programs/:id/deactivate - Deactivate reward program
router.patch('/:id/deactivate', validateId, RewardController.deactivateReward);

// DELETE /api/reward-programs/:id - Delete reward program
router.delete('/:id', validateId, RewardController.deleteReward);

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('RewardProgram routes error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;