const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const { handleOrderValidation } = require('../middlewares/validationMiddleware');

const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.post('/', handleOrderValidation, createOrder); 
router.put('/:id', verifyToken, isAdmin, updateOrder);
router.delete('/:id', verifyToken, isAdmin, deleteOrder);

module.exports = router;