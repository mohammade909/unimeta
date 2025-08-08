// controllers/system.setting.controller.js - Fixed version
const SystemSettings = require('../models/SystemSettings');

class SystemSettingsController {
  // GET /api/system-settings - Get all system settings with pagination and filters
  async getAllSettings(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        setting_key,
        is_active,
        search
      } = req.query;

      // Convert and validate pagination parameters
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page number'
        });
      }

      if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page size (must be between 1 and 100)'
        });
      }

      // Build filters object
      const filters = {};
      
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true' ? 1 : 0;
      }

      if (setting_key || search) {
        filters.setting_key = setting_key || search;
      }

      // Calculate offset
      const offset = (pageNum - 1) * pageSizeNum;
      
      // Set pagination in filters
      filters.limit = pageSizeNum;
      filters.offset = offset;

      console.log('Filters being passed:', filters);

      // Get data and count
      const [settings, totalCount] = await Promise.all([
        SystemSettings.findAll(filters),
        SystemSettings.count(filters)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / pageSizeNum);
      const hasMore = pageNum < totalPages;

      res.json({
        success: true,
        data: settings,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          totalCount,
          totalPages,
          hasMore,
          hasPrevious: pageNum > 1
        }
      });
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system settings',
        error: error.message
      });
    }
  }

  // GET /api/system-settings/count - Get count of system settings
  async getSettingsCount(req, res) {
    try {
      const { setting_key, is_active, search } = req.query;

      // Build filters object
      const filters = {};
      
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true' ? 1 : 0;
      }

      if (setting_key || search) {
        filters.setting_key = setting_key || search;
      }

      const count = await SystemSettings.count(filters);

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Count query error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to count system settings',
        error: error.message
      });
    }
  }

  // GET /api/system-settings/:id - Get system setting by ID
  async getSettingById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting ID'
        });
      }

      const setting = await SystemSettings.findById(parseInt(id));

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'System setting not found'
        });
      }

      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      console.error('Get setting by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system setting',
        error: error.message
      });
    }
  }

  // GET /api/system-settings/key/:key - Get system setting by key
  async getSettingByKey(req, res) {
    try {
      const { key } = req.params;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting key'
        });
      }

      const setting = await SystemSettings.findByKey(key);

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'System setting not found'
        });
      }

      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      console.error('Get setting by key error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system setting',
        error: error.message
      });
    }
  }

  // GET /api/system-settings/value/:key - Get setting value by key
  async getSettingValue(req, res) {
    try {
      const { key } = req.params;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting key'
        });
      }

      const value = await SystemSettings.getValueByKey(key);

      if (value === null) {
        return res.status(404).json({
          success: false,
          message: 'System setting not found or inactive'
        });
      }

      res.json({
        success: true,
        value
      });
    } catch (error) {
      console.error('Get setting value error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system setting value',
        error: error.message
      });
    }
  }

  // POST /api/system-settings - Create new system setting
  async createSetting(req, res) {
    try {
      const { setting_key, setting_value, description, setting_type } = req.body;

      // Validation
      if (!setting_key || !setting_value) {
        return res.status(400).json({
          success: false,
          message: 'Setting key and value are required'
        });
      }

      // Check if key already exists
      const existingSetting = await SystemSettings.findByKey(setting_key);
      if (existingSetting) {
        return res.status(400).json({
          success: false,
          message: 'Setting key already exists'
        });
      }

      const newSetting = await SystemSettings.create({
        setting_key,
        setting_value,
        description,
        setting_type
      });

      res.status(201).json({
        success: true,
        data: newSetting,
        message: 'System setting created successfully'
      });
    } catch (error) {
      console.error('Create setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create system setting',
        error: error.message
      });
    }
  }

  // PUT /api/system-settings/:id - Update system setting by ID
  async updateSetting(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting ID'
        });
      }

      const updatedSetting = await SystemSettings.update(parseInt(id), updateData);

      res.json({
        success: true,
        data: updatedSetting,
        message: 'System setting updated successfully'
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system setting',
        error: error.message
      });
    }
  }

  // PATCH /api/system-settings/value/:key - Update setting value by key
  async updateSettingValue(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!key || typeof key !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting key'
        });
      }

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Value is required'
        });
      }

      const updatedSetting = await SystemSettings.updateValueByKey(key, value);

      res.json({
        success: true,
        data: updatedSetting,
        message: 'System setting value updated successfully'
      });
    } catch (error) {
      console.error('Update setting value error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system setting value',
        error: error.message
      });
    }
  }

  // PATCH /api/system-settings/:id/deactivate - Soft delete (deactivate) system setting
  async softDeleteSetting(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting ID'
        });
      }

      await SystemSettings.softDelete(parseInt(id));

      res.json({
        success: true,
        message: 'System setting deactivated successfully'
      });
    } catch (error) {
      console.error('Soft delete setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate system setting',
        error: error.message
      });
    }
  }

  // DELETE /api/system-settings/:id - Delete system setting by ID
  async deleteSetting(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid setting ID'
        });
      }

      await SystemSettings.delete(parseInt(id));

      res.json({
        success: true,
        message: 'System setting deleted successfully'
      });
    } catch (error) {
      console.error('Delete setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete system setting',
        error: error.message
      });
    }
  }
}

module.exports = new SystemSettingsController();