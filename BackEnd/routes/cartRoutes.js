const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getMyCart, createCart, clearCart, addItemToCart, updateItemQuantity, removeItem } = require('../controllers/cartController');

router.use(verifyToken);
// Quản lý Giỏ hàng tổng
router.get('/my-cart', getMyCart);
router.post('/', createCart);
router.delete('/:id', clearCart);

// Quản lý Chi tiết món hàng
router.post('/items', addItemToCart);
router.put('/items/:id', updateItemQuantity);
router.delete('/items/:id', removeItem);

module.exports = router;