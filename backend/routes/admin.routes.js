const express = require("express");
const AdminController = require('../controllers/admin.controller');
const router = require('express').Router();

const controller = new AdminController();

router.get('/stats', controller.getDashboardStats);

module.exports = router;
