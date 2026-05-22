const Order = require('../models/orderModel');

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.status(200).json(orders);
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

const updateOrder = async (req, res) => {
    try {
        const updated = await Order.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Không thấy đơn hàng" });
        res.status(200).json({ message: "Cập nhật thành công", data: updated });
    } catch (error) {
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

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };