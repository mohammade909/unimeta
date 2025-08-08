const MlmLevelConfig = require('../models/LevelConfig');
const levelConfigSchema = require('../validatiors/level.config');

class LevelConfigController {
  constructor() {
    this.model = new MlmLevelConfig();
  }

  // GET /api/mlm-levels
  async index(req, res) {
    try {
      const { error, value } = levelConfigSchema.query.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { active_only, page, limit } = value;

      let result;
      if (req.query.paginated === 'true') {
        result = await this.model.getPaginated(page, limit, active_only);
      } else {
        const data = await this.model.getAll(active_only);
        result = {
          data,
          count: data.length
        };
      }

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/mlm-levels/:id
  async show(req, res) {
    try {
      const { id } = req.params;
      const level = await this.model.getById(id);

      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      res.json({
        success: true,
        data: level
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/mlm-levels
  async store(req, res) {
    try {
      const { error, value } = levelConfigSchema.create.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Check if level number already exists
      const exists = await this.model.levelNumberExists(value.level_number);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Level number already exists'
        });
      }

      const newLevel = await this.model.create(value);

      res.status(201).json({
        success: true,
        message: 'Level created successfully',
        data: newLevel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/mlm-levels/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = levelConfigSchema.update.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Check if level exists
      const existingLevel = await this.model.getById(id);
      if (!existingLevel) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      // Check if level number already exists (excluding current record)
      const exists = await this.model.levelNumberExists(value.level_number, id);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Level number already exists'
        });
      }

      const updatedLevel = await this.model.update(id, value);

      res.json({
        success: true,
        message: 'Level updated successfully',
        data: updatedLevel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/mlm-levels/:id
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      // Check if level exists
      const level = await this.model.getById(id);
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      await this.model.delete(id);

      res.json({
        success: true,
        message: 'Level deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/mlm-levels/:id/toggle-active
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      
      // Check if level exists
      const level = await this.model.getById(id);
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        });
      }

      const updatedLevel = await this.model.toggleActive(id);

      res.json({
        success: true,
        message: 'Level status updated successfully',
        data: updatedLevel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/mlm-levels/level/:levelNumber/commission
  async getCommissionRate(req, res) {
    try {
      const { levelNumber } = req.params;
      const commission = await this.model.getCommissionPercentage(levelNumber);

      res.json({
        success: true,
        data: {
          level_number: parseInt(levelNumber),
          commission_percentage: commission
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = LevelConfigController;