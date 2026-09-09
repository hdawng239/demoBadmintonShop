const AppError = require('./AppError');
const transitions = {
    pending: new Set(['processing', 'shipping', 'cancelled']),
    processing: new Set(['shipping', 'cancelled']),
    shipping: new Set(['completed']),
    completed: new Set(), cancelled: new Set(),
};
const validateTransition = (order, status) => {
    if (!Object.hasOwn(transitions, status)) throw new AppError(400, 'Trạng thái đơn không hợp lệ.');
    if (order.shipping_requested && !order.tracking_code && order.payment_method !== 'store' && status !== 'shipping') {
        throw new AppError(409, 'Vận đơn đang chờ đối soát GHN. Hãy thử lại thao tác giao hàng trước khi thay đổi đơn.');
    }
    const storePickup = order.payment_method === 'store' && status === 'completed' && ['pending', 'processing'].includes(order.status);
    if (status !== order.status && !storePickup && !transitions[order.status]?.has(status)) {
        throw new AppError(400, `Không thể chuyển đơn từ ${order.status} sang ${status}.`);
    }
    if (['shipping', 'completed'].includes(status) && order.payment_method === 'qr' && order.payment_status !== 'paid') {
        throw new AppError(400, 'Không thể giao đơn QR chưa thanh toán.');
    }
    if (status === 'completed' && order.payment_status !== 'paid') {
        throw new AppError(400, 'Cần xác nhận thu tiền trước khi hoàn thành đơn.');
    }
};
module.exports = { validateTransition };
