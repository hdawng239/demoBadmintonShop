const calculateDiscounts = ({ voucher, subtotal, shippingFee = 0 }) => {
    const safeSubtotal = Math.max(0, Number(subtotal) || 0);
    const safeShippingFee = Math.max(0, Number(shippingFee) || 0);
    if (!voucher) return { orderDiscount: 0, shippingDiscount: 0 };

    const value = Math.max(0, Number(voucher.discount_value) || 0);
    const type = voucher.discount_type;
    let orderDiscount = 0;
    let shippingDiscount = 0;

    if (type === 'fixed' || type === 'fixed_amount') {
        orderDiscount = Math.min(safeSubtotal, value);
    } else if (type === 'percentage') {
        orderDiscount = safeSubtotal * Math.min(value, 100) / 100;
        if (voucher.max_discount !== null && voucher.max_discount !== undefined) {
            orderDiscount = Math.min(orderDiscount, Math.max(0, Number(voucher.max_discount) || 0));
        }
    } else if (['shipping', 'freeship', 'free_shipping'].includes(type)) {
        shippingDiscount = value > 0 ? Math.min(safeShippingFee, value) : safeShippingFee;
    }

    return { orderDiscount: Math.round(orderDiscount), shippingDiscount: Math.round(shippingDiscount) };
};

const calculateTotal = ({ subtotal, shippingFee = 0, orderDiscount = 0, shippingDiscount = 0 }) => Math.round(Math.max(
    0,
    Number(subtotal) - Number(orderDiscount) + Number(shippingFee) - Number(shippingDiscount)
));

module.exports = { calculateDiscounts, calculateTotal };
