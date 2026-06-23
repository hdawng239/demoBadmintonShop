const asyncHandler = require('../utils/asyncHandler');
const GHNService = require('../services/ghnService');

const getProvinces = asyncHandler(async (req, res) => {
    const data = await GHNService.getProvinces();
    res.status(200).json(data);
});

const getDistricts = asyncHandler(async (req, res) => {
    if (!req.body.province_id) {
        return res.status(400).json({ message: 'Thiếu province_id' });
    }
    const data = await GHNService.getDistricts(req.body.province_id);
    res.status(200).json(data);
});

const getWards = asyncHandler(async (req, res) => {
    if (!req.body.district_id) {
        return res.status(400).json({ message: 'Thiếu district_id' });
    }
    const data = await GHNService.getWards(req.body.district_id);
    res.status(200).json(data);
});

const calculateFee = asyncHandler(async (req, res) => {
    const { to_district_id, to_ward_code } = req.body;
    if (!to_district_id || !to_ward_code) {
        return res.status(400).json({ message: 'Thiếu thông tin người nhận' });
    }
    const data = await GHNService.calculateFee(req.body);
    res.status(200).json(data);
});

module.exports = { getProvinces, getDistricts, getWards, calculateFee };
