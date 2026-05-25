const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/dashboard-stats', verifyToken, isAdmin, getDashboardStats);

module.exports = router;
