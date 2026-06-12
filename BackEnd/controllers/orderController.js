const Order = require('../models/orderModel');

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const ordersData = await Order.getAll(page, limit);
        res.status(200).json(ordersData);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.getByUserId(userId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const { cartItems, ...orderData } = req.body;
        // Gọi Model xử lý toàn bộ transaction hạ tầng DB
        const orderId = await Order.createWithItems(orderData, cartItems);
        res.status(201).json({ message: "Đặt hàng thành công trọn vẹn!", orderId });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống thanh toán", error: error.message });
    }
};

const ghnService = require('../services/ghnService');

const updateOrder = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // GHN Integration: If status is updated to shipping, create GHN order
        if (updateData.status === 'shipping') {
            const currentOrder = await Order.getById(req.params.id);
            if (currentOrder && currentOrder.payment_method !== 'store' && !currentOrder.tracking_code) {
                try {
                    const trackingCode = await ghnService.createShippingOrder(currentOrder);
                    updateData.tracking_code = trackingCode;
                } catch (ghnError) {
                    console.error("GHN Error during update:", ghnError);
                    // Decide if we want to block the update or just skip tracking code. We'll block and return error to alert Admin.
                    return res.status(400).json({ message: "Lỗi tạo đơn GHN: " + ghnError.message });
                }
            }
        }

        const updated = await Order.update(req.params.id, updateData);
        if (!updated) return res.status(404).json({ message: "Không thấy đơn hàng" });
        res.status(200).json({ message: "Cập nhật thành công", data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const deleted = await Order.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không thấy đơn hàng" });
        res.status(200).json({ message: "Đã xóa đơn hàng" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Kiểm tra đơn hàng tồn tại
        const order = await Order.getById(id);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // 2. Xác thực quyền: chỉ Admin hoặc chính khách hàng tạo đơn mới được hủy
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này!" });
        }

        // 3. Thực hiện hủy đơn
        await Order.cancelOrderById(id);
        res.status(200).json({ message: "Hủy đơn hàng thành công!" });
    } catch (error) {
        console.error("Lỗi hủy đơn hàng:", error);
        res.status(500).json({ message: error.message || "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, deleteOrder, cancelOrder };