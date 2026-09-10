const AppError = require('./AppError');
const getShippingClientCode = (orderId) => {
    const prefix = String(process.env.GHN_CLIENT_PREFIX || 'NARO')
        .replace(/[^A-Za-z0-9]/g, '').slice(0, 40) || 'NARO';
    return `${prefix}${Number(orderId)}`;
};
const positive = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.ceil(n) : fallback;
};
const getItemMetrics = (item) => {
    let specs = item.technical_specs || {};
    if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (_) { specs = {}; }
    }
    const label = typeof specs?.weight === 'string' ? specs.weight : '';
    // Chỉ đọc số có đơn vị g/kg, tránh nhầm ký hiệu như 4U.
    const grams = label.match(/(\d+(?:\.\d+)?)\s*(?:g|gram)\b/i);
    const kilograms = label.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
    const weight = positive(specs?.weight_g, kilograms ? Math.ceil(Number(kilograms[1]) * 1000)
        : grams ? Math.ceil(Number(grams[1])) : 500);
    return { width: positive(specs?.width, 10), height: positive(specs?.height, 10), length: positive(specs?.length, 10), weight };
};
const getPackageMetrics = (items) => {
    let weight = 100; // Cộng 100 g bao bì khi báo phí và tạo vận đơn.
    let length = 10, width = 10, height = 10;
    for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new AppError(400, 'Số lượng đóng gói không hợp lệ.');
        const metrics = getItemMetrics(item);
        weight += metrics.weight * quantity;
        length = Math.max(length, metrics.length);
        width = Math.max(width, metrics.width);
        height += metrics.height * quantity;
    }
    if (!items.length || weight > 50000 || Math.max(length, width, height) > 200) {
        throw new AppError(400, 'Kiện hàng vượt giới hạn GHN. Vui lòng chia thành các đơn nhỏ hơn.');
    }
    return { weight, length, width, height };
};
const shipmentPayment = (order) => {
    if (!['cod', 'qr'].includes(order.payment_method)) throw new AppError(400, 'Hình thức giao hàng không hợp lệ.');
    if (order.payment_method === 'qr' && order.payment_status !== 'paid') throw new AppError(400, 'QR chưa thanh toán.');
    const amount = Number(order.total_amount);
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > 50000000) throw new AppError(400, 'Số tiền vượt giới hạn thu hộ GHN.');
    // Shop trả GHN; phí ship khách chịu đã nằm trong tổng tiền.
    return { payment_type_id: 1, cod_amount: order.payment_status === 'paid' ? 0 : amount };
};
module.exports = { getShippingClientCode, getItemMetrics, getPackageMetrics, shipmentPayment };
