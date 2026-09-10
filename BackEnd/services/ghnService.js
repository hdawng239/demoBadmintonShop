const axios = require('axios');

const GHN_API_URL = process.env.GHN_API_URL || (process.env.NODE_ENV === 'production'
    ? 'https://online-gateway.ghn.vn/shiip/public-api' : 'https://dev-online-gateway.ghn.vn/shiip/public-api');
const GHN_TOKEN = process.env.KEY_TOKEN_SHOP;
const GHN_SHOP_ID = process.env.KEY_IDSHOP;
const http = axios.create({ timeout: parseInt(process.env.OUTBOUND_HTTP_TIMEOUT_MS || '8000', 10) });

const { getShippingClientCode, getItemMetrics, getPackageMetrics, shipmentPayment } = require('../utils/shipping');

const getHeaders = () => ({
    Token: (GHN_TOKEN || '').trim(),
    'Content-Type': 'application/json',
});

const requireShippingCredentials = () => {
    if (!GHN_TOKEN || !GHN_SHOP_ID) {
        throw new Error('GHN API keys are missing in environment variables');
    }
};

const getGhnMessage = (body) => String(body?.message || body?.code_message_value || '').trim();
const isRetryableError = (error) => !error.response || error.response.status >= 500
    || /timeout|deadline exceeded|temporarily unavailable/i.test(getGhnMessage(error.response?.data));

// Chỉ gỡ cờ khi GHN xác nhận không có đơn, không dựa vào lỗi kết nối.
const isExplicitNotFound = (response) => {
    const body = response?.data;
    if (![200, 400, 404].includes(response?.status)
        || ![400, 404].includes(Number(body?.code)) || body?.data !== null) return false;
    const message = getGhnMessage(body).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').replace(/[.!]+$/, '').trim();
    return ['don hang khong ton tai', 'khong tim thay don hang',
        'order not found', 'order does not exist', 'shipping order not found'].includes(message);
};

const getProviderItems = (items) => items.map((item) => ({
    name: item.product_name || 'San pham',
    code: String(item.variant_id || item.product_name || 'item').slice(0, 20),
    quantity: Number(item.quantity),
    ...getItemMetrics(item),
}));

const GHNService = {
    getProvinces: async () => {
        const response = await http.get(`${GHN_API_URL}/master-data/province`, { headers: getHeaders() });
        return response.data;
    },

    getDistricts: async (provinceId) => {
        const response = await http.post(
            `${GHN_API_URL}/master-data/district`,
            { province_id: parseInt(provinceId) },
            { headers: getHeaders() }
        );
        return response.data;
    },

    getWards: async (districtId) => {
        const response = await http.post(
            `${GHN_API_URL}/master-data/ward`,
            { district_id: parseInt(districtId) },
            { headers: getHeaders() }
        );
        return response.data;
    },

    calculateFee: async ({ to_district_id, to_ward_code, weight, length, width, height, items }) => {
        const data = {
            from_district_id: Number.parseInt(process.env.SHOP_DISTRICT_ID, 10),
            from_ward_code: process.env.SHOP_WARD_CODE,
            to_district_id,
            to_ward_code,
            weight: weight || 1000,
            length: length || 20,
            width: width || 20,
            height: height || 10,
            service_type_id: Number(weight) >= 20000 ? 5 : 2,
            ...(items ? { items: getProviderItems(items) } : {}),
        };

        const response = await http.post(`${GHN_API_URL}/v2/shipping-order/fee`, data, {
            headers: { ...getHeaders(), ShopId: (GHN_SHOP_ID || '').trim() },
        });
        return response.data;
    },

    calculateOrderFee: async ({ to_district_id, to_ward_code, items }) => {
        const metrics = getPackageMetrics(items);
        const response = await GHNService.calculateFee({ to_district_id, to_ward_code, ...metrics, items });
        const total = Number(response?.data?.total);
        if (!Number.isFinite(total) || total < 0) throw new Error('GHN trả về phí vận chuyển không hợp lệ');
        return Math.round(total);
    },

    createShippingOrder: async (orderData) => {
        requireShippingCredentials();

        const metrics = getPackageMetrics(orderData.items);

        const items = getProviderItems(orderData.items).map((item, index) => ({
            ...item, price: Number(orderData.items[index].price_at_time),
        }));

        const payload = {
            ...shipmentPayment(orderData),
            client_order_code: orderData.shipping_client_code || getShippingClientCode(orderData.id),
            note: `Đơn hàng #${orderData.id} từ Naro Shop`,
            required_note: 'KHONGCHOXEMHANG',
            to_name: orderData.shipping_name,
            to_phone: orderData.shipping_phone,
            to_address: orderData.shipping_address,
            to_ward_code: String(orderData.to_ward_code),
            to_district_id: Number.parseInt(orderData.to_district_id, 10),
            ...metrics,
            service_type_id: metrics.weight >= 20000 ? 5 : 2,
            items,
        };

        let response;
        for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
                response = await http.post(
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
                break;
            } catch (error) {
                if (attempt === 1 || !isRetryableError(error)) throw error;
            }
        }

        if (response.data && response.data.code === 200) {
            return response.data.data.order_code;
        }
        throw new Error(response.data.message || 'Failed to create GHN order');
    },

    // Tra cứu bằng client_order_code đã lưu để đối soát lần tạo đơn trước.
    findShippingOrderByClientCode: async (clientOrderCode) => {
        requireShippingCredentials();
        if (typeof clientOrderCode !== 'string' || !/^[A-Za-z0-9_-]{1,50}$/.test(clientOrderCode)) {
            throw new Error('Invalid GHN client order code');
        }

        let response;
        try {
            response = await http.post(
                `${GHN_API_URL}/v2/shipping-order/detail-by-client-code`,
                { client_order_code: clientOrderCode },
                { headers: { ...getHeaders(), ShopId: GHN_SHOP_ID.trim() } }
            );
        } catch (error) {
            if (isExplicitNotFound(error.response)) return null;
            throw error;
        }

        const body = response.data;
        if (isExplicitNotFound(response)) return null;
        if (response.status !== 200 || Number(body?.code) !== 200) {
            throw new Error(getGhnMessage(body) || 'GHN reconciliation failed');
        }
        if (Array.isArray(body.data) && body.data.length !== 1) {
            throw new Error('GHN returned an ambiguous order detail');
        }
        const detail = Array.isArray(body.data) ? body.data[0] : body.data;
        if (!detail || typeof detail !== 'object' || Array.isArray(detail)
            || typeof detail.order_code !== 'string' || !detail.order_code.trim()
            || detail.client_order_code !== clientOrderCode
            || Number(detail.shop_id) !== Number(GHN_SHOP_ID)) {
            throw new Error('GHN returned an invalid or mismatched order detail');
        }
        return {
            orderCode: detail.order_code.trim(),
            status: typeof detail.status === 'string' ? detail.status : null,
        };
    },
};

module.exports = GHNService;
