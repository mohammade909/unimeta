const UserWalletAddress = require('../models/UserWallets');

class UserWalletAddressController {
  
  // Create new wallet address
async createWallet(req, res) {
  try {
    console.log('🔔 Entered createWallet controller');

    const user_id = req.user?.id;
    const { wallet_type, wallet_address, is_primary, is_verified } = req.body;

    console.log('📥 Request Data:', {
      user_id,
      wallet_type,
      wallet_address,
      is_primary,
      is_verified
    });

    if (!user_id || !wallet_address) {
      console.warn('⚠️ Missing user_id or wallet_address');
      return res.status(400).json({
        success: false,
        message: 'User ID and wallet address are required'
      });
    }

    // Validate wallet address format (basic validation)
    if (typeof wallet_address !== 'string' || wallet_address.trim().length < 10) {
      console.warn('⚠️ Invalid wallet address format:', wallet_address);
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    console.log('🛠 Creating wallet in DB...');
    const walletData = await UserWalletAddress.create({
      user_id,
      wallet_type,
      wallet_address: wallet_address.trim(),
      is_primary,
      is_verified
    });

    console.log('✅ Wallet created successfully:', walletData);

    res.status(201).json({
      success: true,
      message: 'Wallet address created successfully',
      data: walletData
    });

  } catch (error) {
    console.error('❌ Create wallet error:', error);

    if (error.message.includes('already exists') || error.message.includes('primary wallet')) {
      console.warn('🚫 Wallet conflict error:', error.message);
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create wallet address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


  // Get wallet by ID
  async getWalletById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid wallet ID is required'
        });
      }

      const wallet = await UserWalletAddress.findById(parseInt(id));

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet address not found'
        });
      }

      res.status(200).json({
        success: true,
        data: wallet
      });

    } catch (error) {
      console.error('❌ Get wallet by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet address',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get wallets by user ID
  async getWalletsByUserId(req, res) {
    try {
      const  userId  = req.user.id;
      const { 
        wallet_type, 
        is_primary, 
        is_verified, 
        limit = 50, 
        offset = 0 
      } = req.query;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID is required'
        });
      }

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Add optional filters
      if (wallet_type) options.wallet_type = wallet_type;
      if (is_primary !== undefined) options.is_primary = is_primary === 'true';
      if (is_verified !== undefined) options.is_verified = is_verified === 'true';

      const wallets = await UserWalletAddress.findByUserId(parseInt(userId), options);
      const totalCount = await UserWalletAddress.countByUserId(parseInt(userId));

      res.status(200).json({
        success: true,
        data: wallets,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + wallets.length) < totalCount
        }
      });

    } catch (error) {
      console.error('❌ Get wallets by user ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user wallets',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all wallets with pagination and filters
  async getAllWallets(req, res) {
    try {
      const { 
        wallet_type, 
        is_verified, 
        limit = 50, 
        offset = 0 
      } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Add optional filters
      if (wallet_type) options.wallet_type = wallet_type;
      if (is_verified !== undefined) options.is_verified = is_verified === 'true';

      const wallets = await UserWalletAddress.findAll(options);

      res.status(200).json({
        success: true,
        data: wallets,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          returned: wallets.length
        }
      });

    } catch (error) {
      console.error('❌ Get all wallets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallets',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update wallet address
  async updateWallet(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid wallet ID is required'
        });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.created_at;
      delete updateData.updated_at;

      if (updateData.wallet_address) {
        updateData.wallet_address = updateData.wallet_address.trim();
      }

      const updatedWallet = await UserWalletAddress.update(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Wallet address updated successfully',
        data: updatedWallet
      });

    } catch (error) {
      console.error('❌ Update wallet error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update wallet address',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete wallet address
  async deleteWallet(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid wallet ID is required'
        });
      }

      await UserWalletAddress.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Wallet address deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete wallet error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete wallet address',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Set wallet as primary
  async setPrimaryWallet(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid wallet ID is required'
        });
      }

      const updatedWallet = await UserWalletAddress.setPrimary(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Wallet set as primary successfully',
        data: updatedWallet
      });

    } catch (error) {
      console.error('❌ Set primary wallet error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to set primary wallet',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify wallet address
  async verifyWallet(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid wallet ID is required'
        });
      }

      const verifiedWallet = await UserWalletAddress.verify(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Wallet verified successfully',
        data: verifiedWallet
      });

    } catch (error) {
      console.error('❌ Verify wallet error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to verify wallet',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get primary wallet by user and type
  async getPrimaryWallet(req, res) {
    try {
      const { userId, walletType } = req.params;

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid user ID is required'
        });
      }

      if (!walletType) {
        return res.status(400).json({
          success: false,
          message: 'Wallet type is required'
        });
      }

      const primaryWallet = await UserWalletAddress.getPrimaryWallet(
        parseInt(userId), 
        walletType
      );

      if (!primaryWallet) {
        return res.status(404).json({
          success: false,
          message: 'No primary wallet found for this user and wallet type'
        });
      }

      res.status(200).json({
        success: true,
        data: primaryWallet
      });

    } catch (error) {
      console.error('❌ Get primary wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve primary wallet',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get wallet statistics
  async getWalletStats(req, res) {
    try {
      const stats = await UserWalletAddress.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Get wallet stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search wallet by address
  async searchByAddress(req, res) {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      const wallet = await UserWalletAddress.findByAddress(address.trim());

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet address not found'
        });
      }

      res.status(200).json({
        success: true,
        data: wallet
      });

    } catch (error) {
      console.error('❌ Search wallet by address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search wallet address',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Bulk create wallets (Admin only)
  async bulkCreateWallets(req, res) {
    try {
      const { wallets } = req.body;

      if (!Array.isArray(wallets) || wallets.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Wallets array is required and cannot be empty'
        });
      }

      // Validate each wallet entry
      for (const wallet of wallets) {
        if (!wallet.user_id || !wallet.wallet_address) {
          return res.status(400).json({
            success: false,
            message: 'Each wallet must have user_id and wallet_address'
          });
        }
      }

      const createdWallets = await UserWalletAddress.bulkCreate(wallets);

      res.status(201).json({
        success: true,
        message: `${createdWallets.length} wallet addresses created successfully`,
        data: createdWallets
      });

    } catch (error) {
      console.error('❌ Bulk create wallets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk create wallet addresses',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new UserWalletAddressController();