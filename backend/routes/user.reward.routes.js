const express = require('express');
const router = express.Router();
const UserRewardsController = require('../controllers/user.reward.controller');
const AuthMiddleware = require('../middlewares/auth');

// Initialize controller
router.use(AuthMiddleware.authenticate);
const userRewardsController = new UserRewardsController();

// Reward assignment routes
router.post('/assign', AuthMiddleware.authorize('user'), async (req, res) => {
  await userRewardsController.assignRewardsToUser(req, res);
});

router.post('/assign-all',AuthMiddleware.authorize('admin'), async (req, res) => {
  await userRewardsController.assignRewardsToAllUsers(req, res);
});

// User reward management routes
router.get('/users/dashboard', AuthMiddleware.authorize('user'), async (req, res) => {
  await userRewardsController.getUserRewardDashboard(req, res);
});

router.get('/', AuthMiddleware.authorize('user'), async (req, res) => {
  await userRewardsController.getUserRewards(req, res);
});

router.get('/user/stats', AuthMiddleware.authorize('user'), async (req, res) => {
  await userRewardsController.getUserRewardStats(req, res);
});

router.put('/progress',  AuthMiddleware.authorize('user'), async (req, res) => {
  await userRewardsController.updateUserProgress(req, res);
});

// Claim reward
router.post('/user-rewards/:userRewardId/claim', async (req, res) => {
  await userRewardsController.claimReward(req, res);
});

// System management routes
router.get('/system/status', async (req, res) => {
  await userRewardsController.getRewardsSystemStatus(req, res);
});
 
router.get('/programs', async (req, res) => {
  await userRewardsController.getAvailableRewardPrograms(req, res);
});

router.post('/cleanup-expired', async (req, res) => {
  await userRewardsController.cleanupExpiredRewards(req, res);
});
router.get('/bussiness/', async (req, res) => {
  await userRewardsController.calculateBussiness(req, res);
});
router.post('/process-weekly-rewards', async (req, res) => {
  await userRewardsController.processWeeklyRewards(req, res);
});

module.exports = router;