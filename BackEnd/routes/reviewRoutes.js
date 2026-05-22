const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { handleReviewValidation } = require('../middlewares/validationMiddleware');

router.get('/product/:productId', getProductReviews); // Lấy danh sách review của 1 sản phẩm
router.post('/', handleReviewValidation, createReview); // Gửi review mới (có qua bộ lọc validation)
router.delete('/:id', deleteReview); // Xóa review theo ID

module.exports = router;