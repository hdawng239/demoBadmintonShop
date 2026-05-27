const axios = require('axios');
require('dotenv').config();

const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create';
const GHN_TOKEN = process.env.KEY_TOKEN_SHOP;
const GHN_SHOP_ID = process.env.KEY_IDSHOP;

const createShippingOrder = async (orderData) => {
    try {
        if (!GHN_TOKEN || !GHN_SHOP_ID) {
            throw new Error("GHN API keys are missing in environment variables");
        }

        // Calculate total weight and build items array
        let totalWeight = 0;
        let maxLength = 10, maxWidth = 10, maxHeight = 10;

        const items = orderData.items.map(item => {
            let width = 10, height = 10, length = 10, weight = 500;
            if (item.technical_specs) {
                try {
                    const specs = typeof item.technical_specs === 'string' ? JSON.parse(item.technical_specs) : item.technical_specs;
                    if (specs.width) width = parseInt(specs.width) || width;
                    if (specs.height) height = parseInt(specs.height) || height;
                    if (specs.length) length = parseInt(specs.length) || length;
                    
                    if (specs.weight_g) weight = parseInt(specs.weight_g);
                    else if (specs.weight) weight = parseInt(String(specs.weight).replace(/[^0-9]/g, '')) || weight; // In case weight is '250g'
                } catch(e) {
                    // Ignore parse error, use defaults
                }
            }

            totalWeight += weight * item.quantity;
            if (length > maxLength) maxLength = length;
            if (width > maxWidth) maxWidth = width;
            // Approximate total height by adding item heights
            maxHeight += height * item.quantity;

            return {
                name: item.product_name,
                code: item.product_name.substring(0, 20),
                quantity: item.quantity,
                price: parseInt(item.price_at_time),
                length: length,
                width: width,
                height: height,
                weight: weight
            };
        });

        // Cap maxHeight to something reasonable if it gets too large
        if (maxHeight > 150) maxHeight = 150;

        const payload = {
            payment_type_id: 2, // 2: Buyer pays shipping (or 1: Seller pays) - using 2 for standard e-commerce
            note: `Đơn hàng #${orderData.id} từ Naro Shop`,
            required_note: "KHONGCHOXEMHANG",
            to_name: orderData.shipping_name,
            to_phone: orderData.shipping_phone,
            to_address: orderData.shipping_address,
            to_ward_code: orderData.to_ward_code || "21012",
            to_district_id: orderData.to_district_id || 1442,
            weight: totalWeight,
            length: maxLength,
            width: maxWidth,
            height: maxHeight,
            service_type_id: 2, // Standard delivery
            items: items
        };

        const response = await axios.post(GHN_API_URL, payload, {
            headers: {
                'Token': GHN_TOKEN,
                'ShopId': GHN_SHOP_ID,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.code === 200) {
            return response.data.data.order_code;
        } else {
            throw new Error(response.data.message || "Failed to create GHN order");
        }
    } catch (error) {
        console.error("GHN API Error:", error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || "Lỗi khi kết nối với Giao Hàng Nhanh");
    }
};

module.exports = {
    createShippingOrder
};
