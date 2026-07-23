const asyncHandler = require('../utils/asyncHandler');
const OrderService = require('../services/orderService');
const { sendSuccess } = require('../utils/response');

const getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await OrderService.getAllOrders(page, limit);
    sendSuccess(res, { data: result.data, meta: result.pagination, legacy: result });
});

const getOrderById = asyncHandler(async (req, res) => {
    // Truyền identity để service chặn xem đơn của người khác
    const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { data: order, legacy: order });
});

const getOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await OrderService.getOrdersByUser(req.user.id);
    // FE đang đọc response.data là mảng trực tiếp nên không bọc envelope
    res.status(200).json(orders);
});

const createOrder = asyncHandler(async (req, res) => {
    const { cartItems, ...orderData } = req.body;
    // user_id luôn lấy từ token, không tin client gửi lên
    orderData.user_id = req.user.id;
    const result = await OrderService.createOrder(orderData, cartItems);
    sendSuccess(res, { statusCode: 201, message: 'Đặt hàng thành công!', data: result, legacy: result });
});

const updateOrder = asyncHandler(async (req, res) => {
    const updated = await OrderService.updateOrder(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật thành công', data: updated });
});

const deleteOrder = asyncHandler(async (req, res) => {
    await OrderService.deleteOrder(req.params.id);
    sendSuccess(res, { message: 'Đã xóa đơn hàng' });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const result = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

module.exports = { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, deleteOrder, cancelOrder };
