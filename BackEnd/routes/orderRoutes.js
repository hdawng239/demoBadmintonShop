const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, reconcileShipping, deleteOrder, cancelOrder } = require('../controllers/orderController');
const { handleOrderValidation } = require('../middlewares/validationMiddleware');

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const OrderService = require('../services/orderService');
const OrderRepository = require('../repositories/orderRepository');

router.get('/payment-events', verifyToken, isAdmin, asyncHandler(async (req, res) => {
    res.json({ data: await OrderRepository.listRejectedPayments() });
}));
router.post('/payment-events/:id/retry', verifyToken, isAdmin, asyncHandler(async (req, res) => {
    res.json(await OrderRepository.retryPayment(req.params.id));
}));

router.post('/:id/receipt', verifyToken, isAdmin, asyncHandler(async (req, res) => {
    const order = await OrderService.confirmReceipt(req.params.id, req.body, req.user);
    res.json({ success: true, data: order });
}));

router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/my-orders', verifyToken, getOrdersByUser);
router.get('/:id', verifyToken, getOrderById);
router.post('/', verifyToken, handleOrderValidation, createOrder);
router.post('/:id/shipping/reconcile', verifyToken, isAdmin, reconcileShipping);
router.put('/:id', verifyToken, isAdmin, updateOrder);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);
router.post('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
