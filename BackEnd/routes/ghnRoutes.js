const express = require('express');
const router = express.Router();
const { getProvinces, getDistricts, getWards, calculateFee } = require('../controllers/ghnController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { expensiveOperationLimiter } = require('../middlewares/rateLimiter');

router.get('/provinces', expensiveOperationLimiter, getProvinces);
router.post('/districts', expensiveOperationLimiter, getDistricts);
router.post('/wards', expensiveOperationLimiter, getWards);
router.post('/shipping-fee', verifyToken, expensiveOperationLimiter, calculateFee);

module.exports = router;
