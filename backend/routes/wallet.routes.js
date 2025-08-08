// routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/wallet.controller');
const AuthMiddleware = require('../middlewares/auth');

router.use(AuthMiddleware.authenticate);
// User wallet routes
router.get('/user', AuthMiddleware.authorize('admin','user'), WalletController.getUserWallet);
router.get('/user/transactions', AuthMiddleware.authorize('admin', 'user'), WalletController.getWalletTransactions);
router.get('/user/stats', AuthMiddleware.authorize('admin','user'), WalletController.getWalletStats);

// Admin wallet management routes
router.get('/admin/all', AuthMiddleware.authorize('admin'), WalletController.getAllWallets);
router.post('/admin/user/:userId/add-balance',AuthMiddleware.authorize('admin'),  WalletController.addBalance);
router.post('/admin/user/:userId/deduct-balance',AuthMiddleware.authorize('admin'),  WalletController.deductBalance);
router.put('/admin/user/:userId',AuthMiddleware.authorize('admin'),  WalletController.updateWallet);
router.delete('/admin/user/:userId',AuthMiddleware.authorize('admin'),  WalletController.deleteWallet);
router.post('/admin/transfer',AuthMiddleware.authorize('admin'),  WalletController.transferBalance);

module.exports = router;