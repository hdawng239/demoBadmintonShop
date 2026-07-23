const express = require('express');
const router = express.Router();
const {
    getMyWishlist,
    getMyProductIds,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
} = require('../controllers/wishlistController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả route wishlist đều yêu cầu đăng nhập; user_id lấy từ token.
router.get('/', verifyToken, getMyWishlist);           // danh sách yêu thích (kèm chi tiết SP)
router.get('/ids', verifyToken, getMyProductIds);      // chỉ product_id (để tô tim nhanh)
router.post('/', verifyToken, addToWishlist);          // thêm { product_id }
router.post('/toggle', verifyToken, toggleWishlist);   // bật/tắt { product_id }
router.delete('/:productId', verifyToken, removeFromWishlist);

module.exports = router;
