// controllers/WalletController.js
const UserWallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class WalletController {
  // Get user wallet
  static async getUserWallet(req, res) {
    try {
      
      const userId = req.user.id;
      
      let wallet = await UserWallet.findByUserId(userId);
      
      if (!wallet) {
        // Create wallet if doesn't exist
        wallet = new UserWallet({ user_id: userId });
        await wallet.create();
      }

      res.json({
        success: true,
        wallet: wallet.toJSON()
      });
    } catch (error) {
      console.error('Get user wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user wallet',
        error: error.message
      });
    }
  }

  // Get all wallets (Admin only)
  static async getAllWallets(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const result = await UserWallet.getAll(parseInt(page), parseInt(limit), search);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all wallets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallets',
        error: error.message
      });
    }
  }

  // Add money to user main balance (Admin only)
  static async addBalance(req, res) {
    try {
      const { userId } = req.params;
      const { amount, admin_notes, source_details } = req.body;

      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Find wallet
      let wallet = await UserWallet.findByUserId(userId);
      
      if (!wallet) {
        // Create wallet if doesn't exist
        wallet = new UserWallet({ user_id: userId });
        await wallet.create();
      }

      // Add balance with transaction
      const transactionData = {
        source_type: 'admin_credit',
        source_details: source_details || 'Admin added balance',
        processed_by: req.user ? req.user.id : null, // Assuming admin user info is in req.user
        admin_notes: admin_notes || null,
        currency: 'USD'
      };

      const result = await wallet.addMainBalance(amount, transactionData);

      res.json({
        success: true,
        message: 'Balance added successfully',
        data: {
          wallet: result.wallet.toJSON(),
          transaction_id: result.transaction_id
        }
      });
    } catch (error) {
      console.error('Add balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add balance',
        error: error.message
      });
    }
  }

  // Deduct money from user main balance (Admin only)
  static async deductBalance(req, res) {
    try {
      const { userId } = req.params;
      const { amount, admin_notes, source_details } = req.body;

      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      // Find wallet
      const wallet = await UserWallet.findByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Check if sufficient balance
      if (parseFloat(wallet.main_balance) < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Deduct balance with transaction
      const transactionData = {
        source_type: 'admin_debit',
        source_details: source_details || 'Admin deducted balance',
        processed_by: req.user ? req.user.id : null, // Assuming admin user info is in req.user
        admin_notes: admin_notes || null,
        currency: 'USD'
      };

      const result = await wallet.deductMainBalance(amount, transactionData);

      res.json({
        success: true,
        message: 'Balance deducted successfully',
        data: {
          wallet: result.wallet.toJSON(),
          transaction_id: result.transaction_id
        }
      });
    } catch (error) {
      console.error('Deduct balance error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to deduct balance',
        error: error.message
      });
    }
  }

  // Update wallet (Admin only)
  static async updateWallet(req, res) {
    try {
      const { userId } = req.params;
      const {
        roi_balance,
        commission_balance,
        bonus_balance,
        locked_amount,
        withdrawal_limit,
        total_earned,
        total_withdrawn,
        total_invested
      } = req.body;

      const wallet = await UserWallet.findByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Update wallet fields
      if (roi_balance !== undefined) wallet.roi_balance = roi_balance;
      if (commission_balance !== undefined) wallet.commission_balance = commission_balance;
      if (bonus_balance !== undefined) wallet.bonus_balance = bonus_balance;
      if (locked_amount !== undefined) wallet.locked_amount = locked_amount;
      if (withdrawal_limit !== undefined) wallet.withdrawal_limit = withdrawal_limit;
      if (total_earned !== undefined) wallet.total_earned = total_earned;
      if (total_withdrawn !== undefined) wallet.total_withdrawn = total_withdrawn;
      if (total_invested !== undefined) wallet.total_invested = total_invested;

      await wallet.update();

      res.json({
        success: true,
        message: 'Wallet updated successfully',
        data: wallet.toJSON()
      });
    } catch (error) {
      console.error('Update wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update wallet',
        error: error.message
      });
    }
  }

  // Get wallet transactions
  static async getWalletTransactions(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await Transaction.getByUserId(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet transactions',
        error: error.message
      });
    }
  }

  // Get wallet statistics
  static async getWalletStats(req, res) {
    try {
      const { userId } = req.params;
      const { date_from, date_to } = req.query;

      const stats = await Transaction.getStatistics(userId, date_from, date_to);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get wallet stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet statistics',
        error: error.message
      });
    }
  }

  // Delete wallet (Admin only)
  static async deleteWallet(req, res) {
    try {
      const { userId } = req.params;

      const wallet = await UserWallet.findByUserId(userId);
      
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      await wallet.delete();

      res.json({
        success: true,
        message: 'Wallet deleted successfully'
      });
    } catch (error) {
      console.error('Delete wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete wallet',
        error: error.message
      });
    }
  }

  // Transfer between wallets (Admin only)
  static async transferBalance(req, res) {
    try {
      const { from_user_id, to_user_id, amount, admin_notes } = req.body;

      // Validate input
      if (!from_user_id || !to_user_id || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transfer data'
        });
      }

      if (from_user_id === to_user_id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to same user'
        });
      }

      // Get both wallets
      const fromWallet = await UserWallet.findByUserId(from_user_id);
      let toWallet = await UserWallet.findByUserId(to_user_id);

      if (!fromWallet) {
        return res.status(404).json({
          success: false,
          message: 'Source wallet not found'
        });
      }

      if (!toWallet) {
        // Create destination wallet if doesn't exist
        toWallet = new UserWallet({ user_id: to_user_id });
        await toWallet.create();
      }

      // Check sufficient balance
      if (parseFloat(fromWallet.main_balance) < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in source wallet'
        });
      }

      // Perform transfer
      const deductData = {
        source_type: 'admin_transfer_out',
        source_details: `Transfer to user ${to_user_id}`,
        processed_by: req.user ? req.user.id : null,
        admin_notes: admin_notes || null,
        related_user_id: to_user_id
      };

      const addData = {
        source_type: 'admin_transfer_in',
        source_details: `Transfer from user ${from_user_id}`,
        processed_by: req.user ? req.user.id : null,
        admin_notes: admin_notes || null,
        related_user_id: from_user_id
      };

      const [deductResult, addResult] = await Promise.all([
        fromWallet.deductMainBalance(amount, deductData),
        toWallet.addMainBalance(amount, addData)
      ]);

      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          from_wallet: deductResult.wallet.toJSON(),
          to_wallet: addResult.wallet.toJSON(),
          deduct_transaction_id: deductResult.transaction_id,
          add_transaction_id: addResult.transaction_id
        }
      });
    } catch (error) {
      console.error('Transfer balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer balance',
        error: error.message
      });
    }
  }
}

module.exports = WalletController;