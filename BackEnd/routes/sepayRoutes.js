const express = require('express');
const router = express.Router();
const { handleSepayWebhook } = require('../controllers/sepayController');

router.post('/webhook', handleSepayWebhook);

module.exports = router;
