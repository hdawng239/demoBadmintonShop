const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, getOrdersByUser, createOrder, updateOrder, deleteOrder, cancelOrder } = require('../controllers/orderController');
const { handleOrderValidation } = require('../middlewares/validationMiddleware');

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/my-orders', verifyToken, getOrdersByUser);
router.get('/:id', getOrderById);
router.post('/', handleOrderValidation, createOrder); 
router.put('/:id', verifyToken, isAdmin, updateOrder);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);
router.post('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;