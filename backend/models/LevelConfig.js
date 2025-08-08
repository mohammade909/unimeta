const { pool } = require('../database');

class LevelConfig {
  constructor() {
    this.table = 'mlm_level_config';
  }

  // Get all levels
  async getAll(activeOnly = false) {
    try {
      let query = `SELECT * FROM ${this.table}`;
      const params = [];
      
      if (activeOnly) {
        query += ' WHERE is_active = ?';
        params.push(true);
      }
      
      query += ' ORDER BY level_number ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching levels: ${error.message}`);
    }
  }

  // Get level by ID
  async getById(id) {
    try {
      const query = `SELECT * FROM ${this.table} WHERE id = ?`;
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching level by ID: ${error.message}`);
    }
  }

  // Get level by level number
  async getByLevelNumber(levelNumber) {
    try {
      const query = `SELECT * FROM ${this.table} WHERE level_number = ?`;
      const [rows] = await pool.execute(query, [levelNumber]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching level by number: ${error.message}`);
    }
  }

  // Create new level
  async create(data) {
    try {
      const query = `
        INSERT INTO ${this.table} (level_number, commission_percentage, is_active) 
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        data.level_number,
        data.commission_percentage,
        data.is_active !== undefined ? data.is_active : true
      ]);
      
      return await this.getById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Level number already exists');
      }
      throw new Error(`Error creating level: ${error.message}`);
    }
  }

  // Update level
  async update(id, data) {
    try {
      const query = `
        UPDATE ${this.table} 
        SET level_number = ?, commission_percentage = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const [result] = await pool.execute(query, [
        data.level_number,
        data.commission_percentage,
        data.is_active,
        id
      ]);
      
      if (result.affectedRows === 0) {
        throw new Error('Level not found');
      }
      
      return await this.getById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Level number already exists');
      }
      throw new Error(`Error updating level: ${error.message}`);
    }
  }

  // Delete level
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.table} WHERE id = ?`;
      const [result] = await pool.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Level not found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Error deleting level: ${error.message}`);
    }
  }

  // Toggle active status
  async toggleActive(id) {
    try {
      const query = `
        UPDATE ${this.table} 
        SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const [result] = await pool.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Level not found');
      }
      
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error toggling level status: ${error.message}`);
    }
  }

  // Get commission percentage for a specific level
  async getCommissionPercentage(levelNumber) {
    try {
      const query = `
        SELECT commission_percentage 
        FROM ${this.table} 
        WHERE level_number = ? AND is_active = true
      `;
      const [rows] = await pool.execute(query, [levelNumber]);
      return rows[0] ? parseFloat(rows[0].commission_percentage) : 0;
    } catch (error) {
      throw new Error(`Error fetching commission percentage: ${error.message}`);
    }
  }

  // Check if level number exists (for validation)
  async levelNumberExists(levelNumber, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.table} WHERE level_number = ?`;
      const params = [levelNumber];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking level number uniqueness: ${error.message}`);
    }
  }

  // Get levels with pagination
  async getPaginated(page = 1, limit = 10, activeOnly = false) {
    try {
      const offset = (page - 1) * limit;
      let query = `SELECT * FROM ${this.table}`;
      let countQuery = `SELECT COUNT(*) as total FROM ${this.table}`;
      const params = [];
      
      if (activeOnly) {
        query += ' WHERE is_active = ?';
        countQuery += ' WHERE is_active = ?';
        params.push(true);
      }
      
      query += ' ORDER BY level_number ASC LIMIT ? OFFSET ?';
      
      const [rows] = await pool.execute(query, [...params, limit, offset]);
      const [countResult] = await pool.execute(countQuery, params);
      
      return {
        data: rows,
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      throw new Error(`Error fetching paginated levels: ${error.message}`);
    }
  }
}

module.exports = LevelConfig;
