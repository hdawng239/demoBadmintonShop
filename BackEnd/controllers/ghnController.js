const asyncHandler = require('../utils/asyncHandler');
const GHNService = require('../services/ghnService');
const OrderRepository = require('../repositories/orderRepository');

const getProvinces = asyncHandler(async (req, res) => {
    const data = await GHNService.getProvinces();
    res.status(200).json(data);
});

const getDistricts = asyncHandler(async (req, res) => {
    const provinceId = Number(req.body.province_id);
    if (!Number.isInteger(provinceId) || provinceId <= 0) {
        return res.status(400).json({ message: 'Thiếu province_id' });
    }
    const data = await GHNService.getDistricts(provinceId);
    res.status(200).json(data);
});

const getWards = asyncHandler(async (req, res) => {
    const districtId = Number(req.body.district_id);
    if (!Number.isInteger(districtId) || districtId <= 0) {
        return res.status(400).json({ message: 'Thiếu district_id' });
    }
    const data = await GHNService.getWards(districtId);
    res.status(200).json(data);
});

const calculateFee = asyncHandler(async (req, res) => {
    const { to_district_id, to_ward_code } = req.body;
    if (!Number.isInteger(Number(to_district_id)) || Number(to_district_id) <= 0 || typeof to_ward_code !== 'string' || !/^\d{1,20}$/.test(to_ward_code)) {
        return res.status(400).json({ message: 'Thiếu thông tin người nhận' });
    }
    const items = await OrderRepository.findItemsForShipping(req.body.cartItems);
    const total = await GHNService.calculateOrderFee({ to_district_id: Number(to_district_id), to_ward_code, items });
    res.status(200).json({ code: 200, data: { total } });
});

module.exports = { getProvinces, getDistricts, getWards, calculateFee };
