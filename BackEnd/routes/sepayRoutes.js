const express = require('express');
const router = express.Router();
const { handleSepayWebhook } = require('../controllers/sepayController');

// Webhook endpoint cho SEPAY (POST)
router.post('/webhook', handleSepayWebhook);

module.exports = router;
