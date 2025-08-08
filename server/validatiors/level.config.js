const Joi = require('joi');

const levelConfigSchema = {
  create: Joi.object({
    level_number: Joi.number().integer().min(1).required()
      .messages({
        'number.base': 'Level number must be a number',
        'number.integer': 'Level number must be an integer',
        'number.min': 'Level number must be at least 1',
        'any.required': 'Level number is required'
      }),
    commission_percentage: Joi.number().min(0).max(100).precision(4).required()
      .messages({
        'number.base': 'Commission percentage must be a number',
        'number.min': 'Commission percentage must be at least 0',
        'number.max': 'Commission percentage must be at most 100',
        'any.required': 'Commission percentage is required'
      }),
    is_active: Joi.boolean().default(true)
  }),

  update: Joi.object({
    level_number: Joi.number().integer().min(1).required(),
    commission_percentage: Joi.number().min(0).max(100).precision(4).required(),
    is_active: Joi.boolean().required()
  }),

  query: Joi.object({
    active_only: Joi.boolean().default(false),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = levelConfigSchema;