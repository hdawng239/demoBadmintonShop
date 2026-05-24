const express = require('express');
const router = express.Router();
const { getProvinces, getDistricts, getWards, calculateFee } = require('../controllers/ghnController');

router.get('/provinces', getProvinces);
router.post('/districts', getDistricts);
router.post('/wards', getWards);
router.post('/shipping-fee', calculateFee);

module.exports = router;
