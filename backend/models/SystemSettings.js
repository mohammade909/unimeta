// models/SystemSettings.js
const Database = require("../database");

// models/SystemSettings.js - Fixed version
class SystemSettings {
  constructor() {
    this.tableName = "system_settings";
  }

  async findAll(filters = {}) {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      const params = [];
      const conditions = [];

      // Add filters
      if (filters.is_active !== undefined) {
        conditions.push("is_active = ?");
        params.push(filters.is_active);
      }

      if (filters.setting_key) {
        conditions.push("setting_key LIKE ?");
        params.push(`%${filters.setting_key}%`);
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      sql += " ORDER BY created_at DESC";

      // Build pagination differently
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = parseInt(filters.offset || 0);

        if (isNaN(limit) || limit <= 0) {
          throw new Error("Invalid limit value");
        }

        if (isNaN(offset) || offset < 0) {
          throw new Error("Invalid offset value");
        }

        // Try building the SQL with values directly first
        sql += ` LIMIT ${limit} OFFSET ${offset}`;

        console.log("SQL Query:", sql);
        console.log("Parameters:", params);

        const results = await Database.query(sql, params);
        return results;
      }

      console.log("SQL Query:", sql);
      console.log("Parameters:", params);

      const results = await Database.query(sql, params);
      return results;
    } catch (error) {
      throw new Error(`Error fetching system settings: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const results = await Database.query(sql, [parseInt(id)]);
      return results[0] || null;
    } catch (error) {
      throw new Error(`Error fetching system setting by ID: ${error.message}`);
    }
  }

  async findByKey(key) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE setting_key = ?`;
      const results = await Database.query(sql, [key]);
      return results[0] || null;
    } catch (error) {
      throw new Error(`Error fetching system setting by key: ${error.message}`);
    }
  }

  async getValueByKey(key) {
    try {
      const sql = `SELECT setting_value FROM ${this.tableName} WHERE setting_key = ? AND is_active = 1`;
      const results = await Database.query(sql, [key]);
      return results[0]?.setting_value || null;
    } catch (error) {
      throw new Error(
        `Error fetching system setting value by key: ${error.message}`
      );
    }
  }

  async count(filters = {}) {
    try {
      let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
      const params = [];
      const conditions = [];

      // Add filters
      if (filters.is_active !== undefined) {
        conditions.push("is_active = ?");
        params.push(filters.is_active);
      }

      if (filters.setting_key) {
        conditions.push("setting_key LIKE ?");
        params.push(`%${filters.setting_key}%`);
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      const results = await Database.query(sql, params);
      return results[0].total;
    } catch (error) {
      throw new Error(`Error counting system settings: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const {
        setting_key,
        setting_value,
        description,
        setting_type = "string",
      } = data;

      const sql = `
        INSERT INTO ${this.tableName} 
        (setting_key, setting_value, description, setting_type, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, 1, NOW(), NOW())
      `;

      const results = await Database.query(sql, [
        setting_key,
        setting_value,
        description || null,
        setting_type,
      ]);

      return { id: results.insertId, ...data };
    } catch (error) {
      throw new Error(`Error creating system setting: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const fields = [];
      const params = [];

      // Build dynamic update query
      if (data.setting_key !== undefined) {
        fields.push("setting_key = ?");
        params.push(data.setting_key);
      }

      if (data.setting_value !== undefined) {
        fields.push("setting_value = ?");
        params.push(data.setting_value);
      }

      if (data.description !== undefined) {
        fields.push("description = ?");
        params.push(data.description);
      }

      if (data.setting_type !== undefined) {
        fields.push("setting_type = ?");
        params.push(data.setting_type);
      }

      if (data.is_active !== undefined) {
        fields.push("is_active = ?");
        params.push(data.is_active);
      }

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      // Always update the updated_at timestamp
      fields.push("updated_at = NOW()");
      params.push(parseInt(id));

      const sql = `UPDATE ${this.tableName} SET ${fields.join(
        ", "
      )} WHERE id = ?`;

      const results = await Database.query(sql, params);

      if (results.affectedRows === 0) {
        throw new Error("System setting not found");
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating system setting: ${error.message}`);
    }
  }

  async updateValueByKey(key, value) {
    try {
      const sql = `UPDATE ${this.tableName} SET setting_value = ?, updated_at = NOW() WHERE setting_key = ?`;
      const results = await Database.query(sql, [value, key]);

      if (results.affectedRows === 0) {
        throw new Error("System setting not found");
      }

      return await this.findByKey(key);
    } catch (error) {
      throw new Error(`Error updating system setting value: ${error.message}`);
    }
  }

  async softDelete(id) {
    try {
      const sql = `UPDATE ${this.tableName} SET is_active = 0, updated_at = NOW() WHERE id = ?`;
      const results = await Database.query(sql, [parseInt(id)]);

      if (results.affectedRows === 0) {
        throw new Error("System setting not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error soft deleting system setting: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const results = await Database.query(sql, [parseInt(id)]);

      if (results.affectedRows === 0) {
        throw new Error("System setting not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting system setting: ${error.message}`);
    }
  }
}

module.exports = new SystemSettings();
