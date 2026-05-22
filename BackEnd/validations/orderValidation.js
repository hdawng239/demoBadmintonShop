const validateOrderCreate = (data) => {
    const errors = [];
    if (!data.user_id) errors.push("Thiếu mã người dùng (user_id)");
    if (!data.shipping_name) errors.push("Tên người nhận không được trống");
    if (!data.shipping_phone) errors.push("Số điện thoại nhận hàng không được trống");
    if (!data.shipping_address) errors.push("Địa chỉ giao hàng không được trống");
    if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
        errors.push("Giỏ hàng (cartItems) phải là một mảng và không được trống");
    } else {
        // Kiểm tra từng món trong giỏ hàng xem có gửi đúng variant_id không
        data.cartItems.forEach((item, index) => {
            if (!item.variant_id) errors.push(`Sản phẩm thứ ${index + 1} thiếu variant_id`);
            if (!item.price) errors.push(`Sản phẩm thứ ${index + 1} thiếu price`);
        });
    }
    return errors;
};

module.exports = { validateOrderCreate };