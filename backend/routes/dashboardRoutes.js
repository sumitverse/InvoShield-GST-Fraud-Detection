const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', verifyToken, dashboardController.getStats);

// GET /api/dashboard/analytics
router.get('/analytics', verifyToken, dashboardController.getAnalytics);

module.exports = router;
