
const express = require('express');
const router = express.Router();
const UserInvestmentController = require('../controllers/user.investment.controller');
const AuthMiddleware = require('../middlewares/auth');

router.use(AuthMiddleware.authenticate);
// Investment CRUD routes
router.post('/', AuthMiddleware.authorize('user'), UserInvestmentController.createInvestment);
router.get('/',AuthMiddleware.authorize('admin'), UserInvestmentController.getAllInvestments);
router.get('/stats',AuthMiddleware.authorize('admin'), UserInvestmentController.getInvestmentStats);
router.get('/due-roi',AuthMiddleware.authorize('admin'), UserInvestmentController.getDueForROI);
router.post('/re-invest/:id',AuthMiddleware.authorize('user'), UserInvestmentController.addAdditionalInvestment);
router.get('/:id',AuthMiddleware.authorize('user'), UserInvestmentController.getInvestmentById);
router.put('/:id',AuthMiddleware.authorize('admin'), UserInvestmentController.updateInvestment);
router.delete('/:id',AuthMiddleware.authorize('admin'), UserInvestmentController.deleteInvestment);

// Specific action routes
router.patch('/:id/status', UserInvestmentController.updateStatus);
router.patch('/:id/roi', UserInvestmentController.updateROI);

// User-specific routes
router.get('/user/me', AuthMiddleware.authorize('user'), UserInvestmentController.getUserInvestments);
router.get('/user/:userId', AuthMiddleware.authorize('admin'), UserInvestmentController.getInvestmentsByUserId);

module.exports = router;