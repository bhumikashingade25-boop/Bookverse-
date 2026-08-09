const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getAdminDashboardStats);

module.exports = router;
