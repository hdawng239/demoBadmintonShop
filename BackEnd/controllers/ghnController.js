const axios = require('axios');
require('dotenv').config();

const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';
const getHeaders = () => ({
    'Token': (process.env.KEY_TOKEN_SHOP || '').trim(),
    'Content-Type': 'application/json'
});

const getProvinces = async (req, res) => {
    try {
        const response = await axios.get(`${GHN_API_URL}/master-data/province`, { headers: getHeaders() });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách tỉnh/thành", error: error.message });
    }
};

const getDistricts = async (req, res) => {
    try {
        const { province_id } = req.body;
        if (!province_id) return res.status(400).json({ message: "Thiếu province_id" });
        
        const response = await axios.get(`${GHN_API_URL}/master-data/district?province_id=${province_id}`, { headers: getHeaders() });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách quận/huyện", error: error.message });
    }
};

const getWards = async (req, res) => {
    try {
        const { district_id } = req.body;
        if (!district_id) return res.status(400).json({ message: "Thiếu district_id" });
        
        const response = await axios.get(`${GHN_API_URL}/master-data/ward?district_id=${district_id}`, { headers: getHeaders() });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách phường/xã", error: error.message });
    }
};

const calculateFee = async (req, res) => {
    try {
        const { to_district_id, to_ward_code, weight = 1000, length = 20, width = 20, height = 10 } = req.body;
        
        if (!to_district_id || !to_ward_code) {
            return res.status(400).json({ message: "Thiếu thông tin người nhận" });
        }

        const data = {
            from_district_id: 1454, // Quận 12 (Trụ sở NaviShop)
            to_district_id: to_district_id,
            to_ward_code: to_ward_code,
            weight: weight,
            length: length,
            width: width,
            height: height,
            service_type_id: 2
        };

        const response = await axios.post(
            `${GHN_API_URL}/v2/shipping-order/fee`, 
            data, 
            { headers: { ...getHeaders(), 'ShopId': (process.env.KEY_IDSHOP || '').trim() } }
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tính phí vận chuyển GHN", error: error.response?.data || error.message });
    }
};

module.exports = { getProvinces, getDistricts, getWards, calculateFee };
