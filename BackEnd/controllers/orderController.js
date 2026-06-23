const asyncHandler = require('../utils/asyncHandler');
const OrderService = require('../services/orderService');

// CONTROLLER = chỉ đọc dữ liệu từ request, gọi service, trả response.
const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await OrderService.getAllOrders(page, limit);
    res.status(200).json(result);
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.id);
    res.status(200).json(order);
});

const getOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await OrderService.getOrdersByUser(req.user.id);
    res.status(200).json(orders);
});

const createOrder = asyncHandler(async (req, res) => {
    const { cartItems, ...orderData } = req.body;
    const result = await OrderService.createOrder(orderData, cartItems);
    res.status(201).json({ message: 'Đặt hàng thành công!', ...result });
});

const updateOrder = asyncHandler(async (req, res) => {
    const updated = await OrderService.updateOrder(req.params.id, req.body);
    res.status(200).json({ message: 'Cập nhật thành công', data: updated });
});

const deleteOrder = asyncHandler(async (req, res) => {
    await OrderService.deleteOrder(req.params.id);
    res.status(200).json({ message: 'Đã xóa đơn hàng' });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const result = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.role);
    res.status(200).json(result);
});

module.exports = { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, deleteOrder, cancelOrder };
