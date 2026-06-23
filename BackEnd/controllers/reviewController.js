const asyncHandler = require('../utils/asyncHandler');
const ReviewService = require('../services/reviewService');

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
    const newReview = await ReviewService.createReview(req.body);
    res.status(201).json({ message: 'Gửi đánh giá thành công!', data: newReview });
});

const deleteReview = asyncHandler(async (req, res) => {
    const deleted = await ReviewService.deleteReview(req.params.id);
    res.status(200).json({ message: 'Đã xóa đánh giá thành công', data: deleted });
});

module.exports = { getProductReviews, createReview, deleteReview, getAllReviews };
