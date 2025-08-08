const database = require('../database'); 

class BannerModel {
    constructor() {
        this.tableName = 'banners';
    }

    // Create a new banner
    async create(bannerData) {
        try {
            const { image_url, image_path, alt_text, status} = bannerData;
            
            const sql = `
                INSERT INTO ${this.tableName} 
                (image_url, image_path, alt_text, status)
                VALUES (?, ?, ?, ?)
            `;
            
            const params = [
                image_url,
                image_path,
                alt_text || null,
                status || 'active',
            ];

            const result = await database.query(sql, params);
            
            // Return the created banner with its ID
            return await this.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error creating banner:', error);
            throw new Error('Failed to create banner');
        }
    }

    // Find banner by ID
    async findById(id) {
        try {
            const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const result = await database.query(sql, [id]);
            
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('❌ Error finding banner by ID:', error);
            throw new Error('Failed to find banner');
        }
    }

    // Get all banners with optional filters
    async findAll(filters = {}) {
        try {
            let sql = `SELECT * FROM ${this.tableName}`;
            const params = [];
            const conditions = [];

            // Add status filter
            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            }

            // Add conditions to query
            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            // Add ordering
            sql += ' ORDER BY display_order ASC, created_at DESC';

            // Add pagination if provided
            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(parseInt(filters.limit));
                
                if (filters.offset) {
                    sql += ' OFFSET ?';
                    params.push(parseInt(filters.offset));
                }
            }

            const results = await database.queryWithLimitOffset(sql, params);
            return results;
        } catch (error) {
            console.error('❌ Error finding banners:', error);
            throw new Error('Failed to retrieve banners');
        }
    }

    // Update banner
    async update(id, updateData) {
        try {
            const existingBanner = await this.findById(id);
            if (!existingBanner) {
                throw new Error('Banner not found');
            }

            const allowedFields = [ 'image_url', 'image_path', 'alt_text', 'status'];
            const updateFields = [];
            const params = [];

            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key) && updateData[key] !== undefined) {
                    updateFields.push(`${key} = ?`);
                    params.push(updateData[key]);
                }
            });

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            params.push(id); // Add ID for WHERE clause

            const sql = `
                UPDATE ${this.tableName} 
                SET ${updateFields.join(', ')} 
                WHERE id = ?
            `;

            await database.query(sql, params);
            
            // Return updated banner
            return await this.findById(id);
        } catch (error) {
            console.error('❌ Error updating banner:', error);
            throw new Error(error.message || 'Failed to update banner');
        }
    }

    // Delete banner
    async delete(id) {
        try {
            const existingBanner = await this.findById(id);
            if (!existingBanner) {
                throw new Error('Banner not found');
            }

            const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
            const result = await database.query(sql, [id]);

            return {
                success: result.affectedRows > 0,
                deletedBanner: existingBanner
            };
        } catch (error) {
            console.error('❌ Error deleting banner:', error);
            throw new Error(error.message || 'Failed to delete banner');
        }
    }

    // Get banner count
    async getCount(filters = {}) {
        try {
            let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
            const params = [];
            const conditions = [];

            if (filters.status) {
                conditions.push('status = ?');
                params.push(filters.status);
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            const result = await database.query(sql, params);
            return result[0].count;
        } catch (error) {
            console.error('❌ Error getting banner count:', error);
            throw new Error('Failed to get banner count');
        }
    }

    // Update display order
    async updateDisplayOrder(id, displayOrder) {
        try {
            return await this.update(id, { display_order: displayOrder });
        } catch (error) {
            console.error('❌ Error updating display order:', error);
            throw new Error('Failed to update display order');
        }
    }

    // Toggle banner status
    async toggleStatus(id) {
        try {
            const banner = await this.findById(id);
            if (!banner) {
                throw new Error('Banner not found');
            }

            const newStatus = banner.status === 'active' ? 'inactive' : 'active';
            return await this.update(id, { status: newStatus });
        } catch (error) {
            console.error('❌ Error toggling banner status:', error);
            throw new Error('Failed to toggle banner status');
        }
    }
}

module.exports = BannerModel;