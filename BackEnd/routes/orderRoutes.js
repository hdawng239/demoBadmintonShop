const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const { handleOrderValidation } = require('../middlewares/validationMiddleware');

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', handleOrderValidation, createOrder); // Chèn middleware validation bảo vệ luồng đặt hàng
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;