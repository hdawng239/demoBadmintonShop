const OrderRepository = require('../repositories/orderRepository');
const ghnService = require('./ghnService');
const AppError = require('../utils/AppError');

// SERVICE = tầng nghiệp vụ: validation, chống spam, tích hợp GHN, điều phối repository.
const OrderService = {
    getAllOrders: (page, limit) => OrderRepository.findPaginated(page, limit),

    getOrderById: async (id) => {
        const order = await OrderRepository.findById(id);
        if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
        return order;
    },

    getOrdersByUser: (userId) => OrderRepository.findByUserId(userId),

    createOrder: async (orderData, cartItems) => {
        // Chống spam: tối đa 3 đơn pending+unpaid
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
            const orderId = await OrderRepository.createWithItems(orderData, cartItems);
            return { orderId };
        } catch (err) {
            // Chuyển lỗi từ transaction (hết hàng, ngừng kinh doanh...) thành AppError để
            // trả về message cụ thể cho client thay vì "Lỗi hệ thống" chung chung.
            if (err.isOperational) throw err;
            throw new AppError(400, err.message);
        }
    },

    updateOrder: async (id, updateData) => {
        const currentOrder = await OrderRepository.findById(id);
        if (!currentOrder) throw new AppError(404, 'Không tìm thấy đơn hàng');

        // Chặn chuyển trạng thái không hợp lệ
        if (currentOrder.status === 'completed' && updateData.status === 'cancelled') {
            throw new AppError(400, 'Không thể hủy đơn hàng đã hoàn thành!');
        }
        if (currentOrder.status === 'cancelled' && updateData.status === 'completed') {
            throw new AppError(400, 'Không thể hoàn thành đơn hàng đã hủy!');
        }

        // GHN Integration: nếu chuyển sang shipping, tạo đơn GHN
        if (updateData.status === 'shipping') {
            if (currentOrder.payment_method !== 'store' && !currentOrder.tracking_code) {
                try {
                    const trackingCode = await ghnService.createShippingOrder(currentOrder);
                    updateData.tracking_code = trackingCode;
                } catch (ghnError) {
                    throw new AppError(400, 'Lỗi tạo đơn GHN: ' + ghnError.message);
                }
            }
        }

        const updated = await OrderRepository.update(id, updateData);
        return updated;
    },

    deleteOrder: async (id) => {
        const deleted = await OrderRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không thấy đơn hàng');
        return deleted;
    },

    cancelOrder: async (id, userId, userRole) => {
        const order = await OrderRepository.findById(id);
        if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

        // Chỉ admin hoặc chính chủ đơn được hủy
        if (order.user_id !== userId && userRole !== 'admin') {
            throw new AppError(403, 'Bạn không có quyền thực hiện hành động này!');
        }

        try {
            await OrderRepository.cancelById(id);
            return { message: 'Hủy đơn hàng thành công!' };
        } catch (err) {
            if (err.isOperational) throw err;
            throw new AppError(400, err.message);
        }
    },

    // Xử lý thanh toán Sepay (dùng cho sepayController)
    handleSepayPayment: async (orderId, transferAmount) => {
        const order = await OrderRepository.findById(orderId);
        if (!order) throw new AppError(404, 'Order not found');
        if (order.payment_status === 'paid') throw new AppError(400, 'Order is already paid');

        if (parseInt(transferAmount) >= parseInt(order.total_amount)) {
            await OrderRepository.update(orderId, { payment_status: 'paid' });
            return { success: true, message: 'Payment successful, order marked as paid' };
        }
        throw new AppError(400, 'Insufficient transfer amount');
    },

    // Cho scheduler: tự động hủy đơn QR quá hạn
    cancelExpiredQROrders: async () => {
        const expiredIds = await OrderRepository.findExpiredQR();
        for (const id of expiredIds) {
            try {
                console.log(`[Auto-Cancel] Đơn hàng #${id} quá hạn 2 phút chưa thanh toán. Đang tự động hủy...`);
                await OrderRepository.cancelById(id);
            } catch (err) {
                console.error(`[Auto-Cancel] Lỗi hủy đơn #${id}:`, err.message);
            }
        }
    },
};

module.exports = OrderService;
