const database = require('../database'); // Your existing database file

class UserWalletAddress {
  constructor() {
    this.tableName = 'user_wallet_addresses';
  }

  // Create wallet address
  async create(walletData) {
    const {
      user_id,
      wallet_type = 'ethereum',
      wallet_address,
      is_primary = false,
      is_verified = false
    } = walletData;

    // Validate required fields
    if (!user_id || !wallet_address) {
      throw new Error('User ID and wallet address are required');
    }

    try {
      // If setting as primary, unset other primary wallets for this user and wallet type
      if (is_primary) {
        await this.unsetPrimaryWallet(user_id, wallet_type);
      }

      const sql = `
        INSERT INTO ${this.tableName} 
        (user_id, wallet_type, wallet_address, is_primary, is_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await database.query(sql, [
        user_id,
        wallet_type,
        wallet_address,
        is_primary,
        is_verified
      ]);

      return {
        id: result.insertId,
        user_id,
        wallet_type,
        wallet_address,
        is_primary,
        is_verified,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('unique_wallet_address')) {
          throw new Error('Wallet address already exists');
        }
        if (error.message.includes('unique_primary_wallet_per_user_type')) {
          throw new Error('User already has a primary wallet for this type');
        }
      }
      throw error;
    }
  }

  // Find wallet by ID
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await database.query(sql, [id]);
    return result.length > 0 ? result[0] : null;
  }

  // Find wallets by user ID
  async findByUserId(userId, options = {}) {
    let sql = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
    const params = [userId];

    // Add optional filters
    if (options.wallet_type) {
      sql += ` AND wallet_type = ?`;
      params.push(options.wallet_type);
    }

    if (options.is_primary !== undefined) {
      sql += ` AND is_primary = ?`;
      params.push(options.is_primary);
    }

    if (options.is_verified !== undefined) {
      sql += ` AND is_verified = ?`;
      params.push(options.is_verified);
    }

    // Add ordering
    sql += ` ORDER BY is_primary DESC, created_at DESC`;

    // Add pagination if provided
    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(options.limit));
      
      if (options.offset) {
        sql += ` OFFSET ?`;
        params.push(parseInt(options.offset));
      }
    }

    return await database.queryWithLimitOffset(sql, params);
  }

  // Find wallet by address
  async findByAddress(walletAddress) {
    const sql = `SELECT * FROM ${this.tableName} WHERE wallet_address = ?`;
    const result = await database.query(sql, [walletAddress]);
    return result.length > 0 ? result[0] : null;
  }

  // Get all wallets with pagination
  async findAll(options = {}) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];

    // Add WHERE conditions if any filters provided
    const conditions = [];
    
    if (options.wallet_type) {
      conditions.push('wallet_type = ?');
      params.push(options.wallet_type);
    }

    if (options.is_verified !== undefined) {
      conditions.push('is_verified = ?');
      params.push(options.is_verified);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Add ordering
    sql += ` ORDER BY created_at DESC`;

    // Add pagination
    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(options.limit));
      
      if (options.offset) {
        sql += ` OFFSET ?`;
        params.push(parseInt(options.offset));
      }
    }

    return await database.queryWithLimitOffset(sql, params);
  }

  // Update wallet
  async update(id, updateData) {
    const allowedFields = ['wallet_type', 'wallet_address', 'is_primary', 'is_verified'];
    const updates = [];
    const params = [];

    // Build update query dynamically
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    // If setting as primary, unset other primary wallets
    if (updateData.is_primary) {
      const wallet = await this.findById(id);
      if (wallet) {
        await this.unsetPrimaryWallet(wallet.user_id, updateData.wallet_type || wallet.wallet_type, id);
      }
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const sql = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      const result = await database.query(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Wallet address not found');
      }

      return await this.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('unique_wallet_address')) {
          throw new Error('Wallet address already exists');
        }
      }
      throw error;
    }
  }

  // Delete wallet
  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await database.query(sql, [id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Wallet address not found');
    }

    return { message: 'Wallet address deleted successfully' };
  }

  // Set wallet as primary
  async setPrimary(id) {
    const wallet = await this.findById(id);
    if (!wallet) {
      throw new Error('Wallet address not found');
    }

    // Unset other primary wallets for this user and wallet type
    await this.unsetPrimaryWallet(wallet.user_id, wallet.wallet_type, id);

    // Set this wallet as primary
    const sql = `UPDATE ${this.tableName} SET is_primary = true, updated_at = NOW() WHERE id = ?`;
    await database.query(sql, [id]);

    return await this.findById(id);
  }

  // Verify wallet
  async verify(id) {
    const sql = `UPDATE ${this.tableName} SET is_verified = true, updated_at = NOW() WHERE id = ?`;
    const result = await database.query(sql, [id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Wallet address not found');
    }

    return await this.findById(id);
  }

  // Get primary wallet for user by type
  async getPrimaryWallet(userId, walletType) {
    const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ? AND wallet_type = ? AND is_primary = true
    `;
    const result = await database.query(sql, [userId, walletType]);
    return result.length > 0 ? result[0] : null;
  }

  // Get wallet statistics
  async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_wallets,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_wallets,
        COUNT(CASE WHEN is_primary = true THEN 1 END) as primary_wallets,
        wallet_type,
        COUNT(*) as type_count
      FROM ${this.tableName}
      GROUP BY wallet_type
    `;
    return await database.query(sql);
  }

  // Private method to unset primary wallet
  async unsetPrimaryWallet(userId, walletType, excludeId = null) {
    let sql = `
      UPDATE ${this.tableName} 
      SET is_primary = false, updated_at = NOW() 
      WHERE user_id = ? AND wallet_type = ? AND is_primary = true
    `;
    const params = [userId, walletType];

    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }

    await database.query(sql, params);
  }

  // Count total wallets for a user
  async countByUserId(userId) {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = ?`;
    const result = await database.query(sql, [userId]);
    return result[0].count;
  }

  // Bulk create wallets (for admin use)
  async bulkCreate(walletsData) {
    if (!Array.isArray(walletsData) || walletsData.length === 0) {
      throw new Error('Invalid wallets data');
    }

    const connection = await database.beginTransaction();
    
    try {
      const results = [];
      
      for (const walletData of walletsData) {
        const sql = `
          INSERT INTO ${this.tableName} 
          (user_id, wallet_type, wallet_address, is_primary, is_verified, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const [result] = await connection.execute(sql, [
          walletData.user_id,
          walletData.wallet_type || 'ethereum',
          walletData.wallet_address,
          walletData.is_primary || false,
          walletData.is_verified || false
        ]);

        results.push({
          id: result.insertId,
          ...walletData
        });
      }

      await database.commitTransaction(connection);
      return results;
    } catch (error) {
      await database.rollbackTransaction(connection);
      throw error;
    }
  }
}

module.exports = new UserWalletAddress();