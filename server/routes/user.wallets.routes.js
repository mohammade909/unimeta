const express = require('express');
const router = express.Router();
const UserWalletAddressController = require('../controllers/user.wallets.controller');
const AuthMiddleware = require("../middlewares/auth");

router.use(AuthMiddleware.authenticate)

// Route parameter validation middleware
const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid ID parameter is required'
    });
  }
  next();
};

// ==================== WALLET CRUD ROUTES ====================

// Create new wallet address
router.post('/', 
  AuthMiddleware.authorize('user'),
  UserWalletAddressController.createWallet
);

// Get all wallets with pagination and filters
router.get('/', 
  AuthMiddleware.authorize('admin'),
  UserWalletAddressController.getAllWallets
);

// Get wallet statistics (Admin only)
router.get('/stats', 
  AuthMiddleware.authorize('admin'),
  UserWalletAddressController.getWalletStats
);

// Bulk create wallets (Admin only)
router.post('/bulk', 
  AuthMiddleware.authorize('admin'),
  UserWalletAddressController.bulkCreateWallets
);
router.get('/user', 
    AuthMiddleware.authorize('user'),
  UserWalletAddressController.getWalletsByUserId
);

// Search wallet by address
router.get('/search/address/:address', 
  UserWalletAddressController.searchByAddress
);

// Get wallet by ID
router.get('/:id', 
  validateIdParam,
  UserWalletAddressController.getWalletById
);

// Update wallet address
router.put('/:id', 
  validateIdParam,
  UserWalletAddressController.updateWallet
);

// Delete wallet address
router.delete('/:id', 
  
  validateIdParam,
  AuthMiddleware.authorize('user'),
  UserWalletAddressController.deleteWallet
);

// ==================== USER-SPECIFIC ROUTES ====================

// Get all wallets for a specific user


// Get primary wallet for user by wallet type
router.get('/user/:userId/primary/:walletType',
  UserWalletAddressController.getPrimaryWallet
);

// ==================== WALLET ACTION ROUTES ====================

// Set wallet as primary
router.patch('/:id/primary', 
  UserWalletAddressController.setPrimaryWallet
);

// Verify wallet address
router.patch('/:id/verify', 
  UserWalletAddressController.verifyWallet
);

// ==================== ERROR HANDLING MIDDLEWARE ====================



// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('❌ Wallet routes error:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error in wallet routes',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;