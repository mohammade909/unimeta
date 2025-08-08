const express = require('express');
const router = express.Router();
const LevelConfigController = require('../controllers/level.config.controller');

const controller = new LevelConfigController();
// GET /api/mlm-levels - Get all levels
router.get('/', async (req, res) => {
  await controller.index(req, res);
});

// GET /api/mlm-levels/:id - Get specific level
router.get('/:id', async (req, res) => {
  await controller.show(req, res);
});

// POST /api/mlm-levels - Create new level
router.post('/', async (req, res) => {
  await controller.store(req, res);
});

// PUT /api/mlm-levels/:id - Update level
router.put('/:id', async (req, res) => {
  await controller.update(req, res);
});

// DELETE /api/mlm-levels/:id - Delete level
router.delete('/:id', async (req, res) => {
  await controller.destroy(req, res);
});

// PUT /api/mlm-levels/:id/toggle-active - Toggle active status
router.put('/:id/toggle-active', async (req, res) => {
  await controller.toggleActive(req, res);
});

// GET /api/mlm-levels/level/:levelNumber/commission - Get commission rate
router.get('/level/:levelNumber/commission', async (req, res) => {
  await controller.getCommissionRate(req, res);
});

module.exports = router;