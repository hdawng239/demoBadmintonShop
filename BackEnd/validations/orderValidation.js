const validateOrderCreate = (data) => {
    const errors = [];
    if (typeof data.shipping_name !== 'string' || !data.shipping_name.trim()) errors.push("Tên người nhận không được trống");
    else if (data.shipping_name.length > 120) errors.push('Tên người nhận không được vượt quá 120 ký tự');
    if (typeof data.shipping_phone !== 'string' || !/^0(3|5|7|8|9)\d{8}$/.test(data.shipping_phone.trim())) {
        errors.push('Số điện thoại nhận hàng không hợp lệ');
    }
    if (typeof data.shipping_address !== 'string' || !data.shipping_address.trim()) errors.push("Địa chỉ giao hàng không được trống");
    else if (data.shipping_address.length > 500) errors.push('Địa chỉ không được vượt quá 500 ký tự');

    const method = String(data.payment_method || 'cod').toLowerCase();
    if (!['cod', 'qr', 'store'].includes(method)) errors.push('Phương thức thanh toán không hợp lệ');
    if (method !== 'store' && (!Number.isInteger(Number(data.to_district_id)) || Number(data.to_district_id) <= 0
        || typeof data.to_ward_code !== 'string' || !/^\d{1,20}$/.test(data.to_ward_code))) {
        errors.push('Thiếu quận/huyện hoặc phường/xã nhận hàng');
    }
    errors.push(...validateCartItems(data.cartItems));
    return errors;
};

const validateCartItems = (cartItems) => {
    const errors = [];
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
        errors.push("Giỏ hàng (cartItems) phải là một mảng và không được trống");
    } else if (cartItems.length > 50) {
        errors.push('Mỗi đơn hàng chỉ được có tối đa 50 phân loại.');
    } else {
        const variantIds = new Set();
        cartItems.forEach((item, index) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                errors.push(`Sản phẩm thứ ${index + 1} không hợp lệ`);
                return;
            }
            const variantId = Number(item.variant_id);
            if (!Number.isInteger(variantId) || variantId <= 0) errors.push(`Sản phẩm thứ ${index + 1} thiếu variant_id hợp lệ`);
            if (variantIds.has(variantId)) errors.push(`Sản phẩm thứ ${index + 1} bị trùng phân loại trong giỏ hàng`);
            variantIds.add(variantId);
            const qty = Number(item.quantity);
            if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
                errors.push(`Số lượng sản phẩm thứ ${index + 1} phải là số nguyên từ 1 đến 99`);
            }
        });
    }
    return errors;
};

module.exports = { validateOrderCreate, validateCartItems };
