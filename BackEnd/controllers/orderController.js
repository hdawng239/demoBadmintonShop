const asyncHandler = require('../utils/asyncHandler');
const OrderService = require('../services/orderService');
const { sendSuccess } = require('../utils/response');
const { parsePagination } = require('../utils/pagination');

const getAllOrders = asyncHandler(async (req, res) => {
    const { page, limit } = parsePagination(req.query.page, req.query.limit, 10, 100);
    const result = await OrderService.getAllOrders(page, limit);
    sendSuccess(res, { data: result.data, meta: result.pagination, legacy: result });
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { data: order, legacy: order });
});

const getOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await OrderService.getOrdersByUser(req.user.id);
    // Giữ mảng trực tiếp để tương thích frontend.
    res.status(200).json(orders);
});

const createOrder = asyncHandler(async (req, res) => {
    const { cartItems, ...orderData } = req.body;
    orderData.user_id = req.user.id;
    const result = await OrderService.createOrder(orderData, cartItems);
    sendSuccess(res, { statusCode: 201, message: 'Đặt hàng thành công!', data: result, legacy: result });
});

const updateOrder = asyncHandler(async (req, res) => {
    const updated = await OrderService.updateOrder(req.params.id, req.body);
    sendSuccess(res, { message: 'Cập nhật thành công', data: updated });
});

const reconcileShipping = asyncHandler(async (req, res) => {
    const result = await OrderService.reconcileShipping(req.params.id, {
        releaseIfMissing: req.body?.releaseIfMissing === true,
    });
    const messages = {
        linked: 'Đã tìm thấy và đồng bộ vận đơn từ GHN.',
        already_linked: 'Đơn đã có mã vận đơn GHN.',
        not_found: 'GHN xác nhận chưa có vận đơn với mã đối soát này.',
        released: 'GHN xác nhận chưa có vận đơn; đã gỡ trạng thái chờ để admin có thể thử lại hoặc hủy đơn.',
    };
    sendSuccess(res, { message: messages[result.action], data: result });
});

const deleteOrder = asyncHandler(async (req, res) => {
    await OrderService.deleteOrder(req.params.id);
    sendSuccess(res, { message: 'Đã xóa đơn hàng' });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const result = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, { message: result.message, data: result, legacy: result });
});

module.exports = { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, reconcileShipping, deleteOrder, cancelOrder };
