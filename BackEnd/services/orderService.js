const OrderRepository = require('../repositories/orderRepository');
const ghnService = require('./ghnService');
const AppError = require('../utils/AppError');

const { validateTransition } = require('../utils/orderState');

const isGhnTimeout = (error) => error?.code === 'ECONNABORTED'
    || /timeout|deadline exceeded|temporarily unavailable/i.test(String(error?.response?.data?.message || error?.message || ''));

const OrderService = {
    getAllOrders: (page, limit) => OrderRepository.findPaginated(page, limit),

    getOrderById: async (id, userId, userRole) => {
        const order = await OrderRepository.findById(id);
        if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

        if (userRole !== 'admin' && order.user_id !== userId) {
            throw new AppError(403, 'Bạn không có quyền xem đơn hàng này!');
        }
        return order;
    },

    getOrdersByUser: (userId) => OrderRepository.findByUserId(userId),

    createOrder: async (orderData, cartItems) => {
        const paymentMethod = String(orderData.payment_method || 'cod').toLowerCase();
        if (!['cod', 'qr', 'store'].includes(paymentMethod)) {
            throw new AppError(400, 'Phương thức thanh toán không hợp lệ.');
        }
        orderData.payment_method = paymentMethod;

        if (orderData.user_id) {
            const pendingCount = await OrderRepository.countPendingUnpaidByUser(orderData.user_id);
            if (pendingCount >= 3) {
                throw new AppError(
                    400,
                    'Bạn đang có quá nhiều đơn hàng chờ xử lý (tối đa 3 đơn). Vui lòng hoàn tất thanh toán hoặc hủy đơn cũ trước khi đặt thêm đơn mới!'
                );
            }
        }

        try {
            if (paymentMethod === 'store') {
                orderData.shipping_fee = 0;
            } else {
                const shippingItems = await OrderRepository.findItemsForShipping(cartItems);
                orderData.shipping_fee = await ghnService.calculateOrderFee({
                    to_district_id: orderData.to_district_id,
                    to_ward_code: orderData.to_ward_code,
                    items: shippingItems,
                });
            }
            const order = await OrderRepository.createWithItems(orderData, cartItems);
            return { orderId: order.id, order };
        } catch (err) {
            if (err.isOperational) throw err;
            if (err.response || err.code === 'ECONNABORTED') {
                throw new AppError(502, 'Không thể xác minh phí vận chuyển. Vui lòng thử lại.');
            }
            throw err;
        }
    },

    updateOrder: async (id, updateData) => {
        // Đổi địa chỉ hoặc giá phải báo phí lại; client không được sửa thanh toán và vận đơn.
        if (Object.keys(updateData).some((key) => key !== 'status') || typeof updateData.status !== 'string') {
            throw new AppError(400, 'API này chỉ cập nhật trạng thái đơn. Thanh toán dùng luồng xác nhận thu tiền riêng.');
        }
        if (updateData.status === 'cancelled') {
            await OrderRepository.cancelById(id);
            return OrderRepository.findById(id);
        }
        if (updateData.status === 'shipping') await OrderRepository.markShippingRequested(id);
        return OrderRepository.withLockedOrder(id, async (order, client) => {
            validateTransition(order, updateData.status);
            const changes = { status: updateData.status };
            if (changes.status === 'shipping' && order.payment_method !== 'store' && !order.tracking_code) {
                // Cờ có thể đã được gỡ giữa hai lần khóa đơn.
                if (!order.shipping_requested) {
                    throw new AppError(409, 'Yêu cầu vận đơn vừa thay đổi. Vui lòng thử lại thao tác giao hàng.');
                }
                try {
                    changes.tracking_code = await ghnService.createShippingOrder(order);
                } catch (error) {
                    if (isGhnTimeout(error)) {
                        throw new AppError(503, 'GHN đang phản hồi chậm. Đơn vẫn ở trạng thái chuẩn bị; vui lòng thử lại sau.');
                    }
                    throw new AppError(502, 'Chưa xác nhận được vận đơn GHN. Thử lại thao tác giao hàng để đối soát cùng mã đơn.');
                }
            }
            return OrderRepository.update(id, changes, client);
        });
    },

    reconcileShipping: async (id, { releaseIfMissing = false } = {}) => {
        if (typeof releaseIfMissing !== 'boolean') {
            throw new AppError(400, 'Tùy chọn đối soát GHN không hợp lệ.');
        }

        // Giữ khóa đến khi đối soát xong để tránh retry chen vào lúc gỡ cờ GHN.
        return OrderRepository.withLockedOrder(id, async (order, client) => {
            if (order.payment_method === 'store') {
                throw new AppError(400, 'Đơn nhận tại cửa hàng không có vận đơn GHN.');
            }
            if (!order.shipping_requested) {
                throw new AppError(409, 'Đơn này không có yêu cầu vận đơn đang chờ đối soát.');
            }
            if (order.tracking_code) {
                return { action: 'already_linked', order };
            }
            if (!['pending', 'processing', 'shipping'].includes(order.status)) {
                throw new AppError(409, 'Trạng thái hiện tại không cho phép đối soát vận đơn.');
            }

            let providerOrder;
            try {
                providerOrder = await ghnService.findShippingOrderByClientCode(order.shipping_client_code);
            } catch (_) {
                throw new AppError(502, 'Không xác nhận được trạng thái từ GHN. Hệ thống chưa thay đổi đơn; vui lòng thử lại sau.');
            }

            if (providerOrder) {
                validateTransition(order, 'shipping');
                const updated = await OrderRepository.syncShippingOrder(id, providerOrder.orderCode, client);
                console.info('[GHN reconcile]', { orderId: Number(id), action: 'linked' });
                return { action: 'linked', providerStatus: providerOrder.status, order: updated };
            }

            if (!releaseIfMissing) {
                return { action: 'not_found', order };
            }

            const updated = await OrderRepository.releaseShippingRequest(id, client);
            if (!updated) throw new AppError(409, 'Không thể gỡ yêu cầu vận đơn ở trạng thái hiện tại.');
            console.warn('[GHN reconcile]', { orderId: Number(id), action: 'released_after_not_found' });
            return { action: 'released', order: updated };
        });
    },

    confirmReceipt: async (id, data, actor) => {
        if (actor?.role !== 'admin') throw new AppError(403, 'Chỉ quản trị viên được xác nhận thu tiền.');
        if (typeof data.reference !== 'string' || !/^[A-Za-z0-9_./:-]{3,120}$/.test(data.reference)) {
            throw new AppError(400, 'Nhập mã đối soát GHN hoặc số phiếu thu (3–120 ký tự).');
        }
        const amount = Number(data.amount);
        if (!Number.isSafeInteger(amount) || amount < 0) throw new AppError(400, 'Số tiền không hợp lệ.');
        return OrderRepository.withLockedOrder(id, async (order, client) => {
            if (!['cod', 'store'].includes(order.payment_method) || order.status === 'cancelled') {
                throw new AppError(400, 'Chỉ xác nhận tiền COD/nhận tại cửa hàng cho đơn chưa hủy.');
            }
            if (order.payment_method === 'cod' && order.status !== 'shipping' && order.status !== 'completed') {
                throw new AppError(400, 'Đơn COD phải được giao trước khi đối soát thu tiền.');
            }
            if (amount !== Number(order.total_amount)) throw new AppError(400, 'Số tiền phải khớp tổng thanh toán của đơn.');
            const existing = await client.query('SELECT reference, amount FROM payment_receipts WHERE order_id = $1', [id]);
            if (existing.rowCount) {
                if (existing.rows[0].reference === data.reference && Number(existing.rows[0].amount) === amount) return order;
                throw new AppError(409, 'Đơn đã có phiếu thu khác.');
            }
            if (order.payment_status !== 'unpaid') throw new AppError(409, 'Đơn đã thanh toán hoặc đang hoàn tiền.');
            await client.query(`INSERT INTO payment_receipts (order_id, actor_id, reference, amount, method)
                VALUES ($1, $2, $3, $4, $5)`, [id, actor.id, data.reference, amount, order.payment_method]);
            const updated = await client.query("UPDATE orders SET payment_status = 'paid', paid_at = NOW() WHERE id = $1 RETURNING *", [id]);
            return updated.rows[0];
        });
    },

    deleteOrder: async (id) => {
        const deleted = await OrderRepository.remove(id);
        if (!deleted) throw new AppError(400, 'Chỉ có thể lưu trữ đơn đã hủy.');
        return deleted;
    },

    cancelOrder: async (id, userId, userRole) => {
        const order = await OrderRepository.findById(id);
        if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

        if (order.user_id !== userId && userRole !== 'admin') {
            throw new AppError(403, 'Bạn không có quyền thực hiện hành động này!');
        }
        if (order.payment_status === 'paid') {
            throw new AppError(400, 'Đơn đã thanh toán không thể tự hủy. Vui lòng liên hệ cửa hàng để hoàn tiền.');
        }

        try {
            await OrderRepository.cancelById(id);
            return { message: 'Hủy đơn hàng thành công!' };
        } catch (err) {
            if (err.isOperational) throw err;
            throw err;
        }
    },

    handleSepayPayment: (payment) => OrderRepository.processSepayPayment(payment),

    cancelExpiredQROrders: async () => {
        const expiredIds = await OrderRepository.findExpiredQR();
        for (const id of expiredIds) {
            try {
                console.log(`[Auto-Cancel] Đơn hàng #${id} quá hạn 5 phút chưa thanh toán. Đang tự động hủy...`);
                await OrderRepository.cancelById(id, { expiredOnly: true });
            } catch (err) {
                console.error(`[Auto-Cancel] Lỗi hủy đơn #${id}:`, err.message);
            }
        }
    },
};

module.exports = OrderService;
