const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { optionalVerifyToken } = require('../middlewares/authMiddleware');
const { expensiveOperationLimiter, aiBudgetLimiter } = require('../middlewares/rateLimiter');
const aiConcurrency = require('../middlewares/aiConcurrency');

router.post('/', expensiveOperationLimiter, aiBudgetLimiter, optionalVerifyToken, aiConcurrency, chatController.handleChat);

module.exports = router;
