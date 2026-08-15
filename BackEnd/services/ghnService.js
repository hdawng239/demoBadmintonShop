const axios = require('axios');
require('dotenv').config();

const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api';
const GHN_TOKEN = process.env.KEY_TOKEN_SHOP;
const GHN_SHOP_ID = process.env.KEY_IDSHOP;

const getHeaders = () => ({
    Token: (GHN_TOKEN || '').trim(),
    'Content-Type': 'application/json',
});

// SERVICE = tầng nghiệp vụ tích hợp Giao Hàng Nhanh.
// Gồm: tra cứu địa chỉ, tính phí, tạo đơn vận chuyển.
const GHNService = {
    // ── Tra cứu địa chỉ ────────────────────────────────────
    getProvinces: async () => {
        const response = await axios.get(`${GHN_API_URL}/master-data/province`, { headers: getHeaders() });
        return response.data;
    },

    getDistricts: async (provinceId) => {
        const response = await axios.post(
            `${GHN_API_URL}/master-data/district`,
            { province_id: parseInt(provinceId) },
            { headers: getHeaders() }
        );
        return response.data;
    },

    getWards: async (districtId) => {
        const response = await axios.post(
            `${GHN_API_URL}/master-data/ward`,
            { district_id: parseInt(districtId) },
            { headers: getHeaders() }
        );
        return response.data;
    },

    // ── Tính phí vận chuyển ─────────────────────────────────
    calculateFee: async ({ to_district_id, to_ward_code, weight, length, width, height }) => {
        const data = {
            from_district_id: 1454,
            to_district_id,
            to_ward_code,
            weight: weight || 1000,
            length: length || 20,
            width: width || 20,
            height: height || 10,
            service_type_id: 2,
        };

        const response = await axios.post(`${GHN_API_URL}/v2/shipping-order/fee`, data, {
            headers: { ...getHeaders(), ShopId: (GHN_SHOP_ID || '').trim() },
        });
        return response.data;
    },

    // ── Tạo đơn vận chuyển GHN ─────────────────────────────
    createShippingOrder: async (orderData) => {
        if (!GHN_TOKEN || !GHN_SHOP_ID) {
            throw new Error('GHN API keys are missing in environment variables');
        }

        let totalWeight = 0;
        let maxLength = 10, maxWidth = 10, maxHeight = 10;

        const items = orderData.items.map((item) => {
            let width = 10, height = 10, length = 10, weight = 500;
            if (item.technical_specs) {
                try {
                    const specs = typeof item.technical_specs === 'string'
                        ? JSON.parse(item.technical_specs)
                        : item.technical_specs;
                    if (specs.width) width = parseInt(specs.width) || width;
                    if (specs.height) height = parseInt(specs.height) || height;
                    if (specs.length) length = parseInt(specs.length) || length;
                    if (specs.weight_g) weight = parseInt(specs.weight_g);
                    else if (specs.weight) weight = parseInt(String(specs.weight).replace(/[^0-9]/g, '')) || weight;
                } catch (e) { /* use defaults */ }
            }

            totalWeight += weight * item.quantity;
            if (length > maxLength) maxLength = length;
            if (width > maxWidth) maxWidth = width;
            maxHeight += height * item.quantity;

            return {
                name: item.product_name,
                code: item.product_name.substring(0, 20),
                quantity: item.quantity,
                price: parseInt(item.price_at_time),
                length, width, height, weight,
            };
        });

        if (maxHeight > 150) maxHeight = 150;

        const payload = {
            payment_type_id: 2,
            note: `Đơn hàng #${orderData.id} từ Naro Shop`,
            required_note: 'KHONGCHOXEMHANG',
            to_name: orderData.shipping_name,
            to_phone: orderData.shipping_phone,
            to_address: orderData.shipping_address,
            to_ward_code: orderData.to_ward_code || '21012',
            to_district_id: orderData.to_district_id || 1442,
            weight: totalWeight,
            length: maxLength,
            width: maxWidth,
            height: maxHeight,
            service_type_id: 2,
            items,
        };

        const response = await axios.post(
            `${GHN_API_URL}/v2/shipping-order/create`,
            payload,
            {
                headers: {
                    Token: GHN_TOKEN,
                    ShopId: GHN_SHOP_ID,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data && response.data.code === 200) {
            return response.data.data.order_code;
        }
        throw new Error(response.data.message || 'Failed to create GHN order');
    },
};

module.exports = GHNService;
