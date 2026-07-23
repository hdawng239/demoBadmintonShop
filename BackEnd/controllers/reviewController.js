const asyncHandler = require('../utils/asyncHandler');
const ReviewService = require('../services/reviewService');
const { sendSuccess } = require('../utils/response');

const getProductReviews = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ReviewService.getProductReviews(req.params.productId, page, limit);
    res.status(200).json(result);
});

const getAllReviews = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await ReviewService.getAllReviews(page, limit);
    res.status(200).json(result);
});

const createReview = asyncHandler(async (req, res) => {
    const { product_id, rating, comment } = req.body;
    const newReview = await ReviewService.createReview({
        user_id: req.user.id,
        product_id,
        rating,
        comment,
    });
    sendSuccess(res, { statusCode: 201, message: 'Gửi đánh giá thành công!', data: newReview });
});

const deleteReview = asyncHandler(async (req, res) => {
    const deleted = await ReviewService.deleteReview(req.params.id);
    sendSuccess(res, { message: 'Đã xóa đánh giá thành công', data: deleted });
});

module.exports = { getProductReviews, createReview, deleteReview, getAllReviews };
