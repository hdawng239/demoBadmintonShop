const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, deleteReview, getAllReviews } = require('../controllers/reviewController');
const { handleReviewValidation } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.get('/', verifyToken, isAdmin, getAllReviews);
router.post('/', verifyToken, handleReviewValidation, createReview);
router.delete('/:id', verifyToken, isAdmin, deleteReview);

module.exports = router;
