const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { handleReviewValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/product/:productId', getProductReviews); // Lấy danh sách review của 1 sản phẩm
router.get('/', verifyToken, isAdmin, getAllReviews); // Admin lấy tất cả review
router.post('/', verifyToken, handleReviewValidation, createReview); // Gửi review mới (có qua bộ lọc validation)
router.delete('/:id', verifyToken, isAdmin, deleteReview); // Xóa review theo ID (Admin)

module.exports = router;