const validateOrderCreate = (data) => {
    const errors = [];
    if (!data.shipping_name || data.shipping_name.trim() === "") errors.push("Tên người nhận không được trống");
    if (!data.shipping_phone || data.shipping_phone.trim() === "") errors.push("Số điện thoại nhận hàng không được trống");
    if (!data.shipping_address || data.shipping_address.trim() === "") errors.push("Địa chỉ giao hàng không được trống");
    if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
        errors.push("Giỏ hàng (cartItems) phải là một mảng và không được trống");
    } else {
        data.cartItems.forEach((item, index) => {
            if (!item.variant_id) errors.push(`Sản phẩm thứ ${index + 1} thiếu variant_id`);
            const qty = parseInt(item.quantity);
            if (isNaN(qty) || qty <= 0) {
                errors.push(`Số lượng sản phẩm thứ ${index + 1} phải là số nguyên dương lớn hơn 0`);
            }
        });
    }
    return errors;
};

module.exports = { validateOrderCreate };