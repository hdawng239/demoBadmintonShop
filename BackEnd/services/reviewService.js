const ReviewRepository = require('../repositories/reviewRepository');
const AppError = require('../utils/AppError');

const ReviewService = {
    getProductReviews: (productId, page, limit) =>
        ReviewRepository.findByProductId(productId, page, limit),

    getAllReviews: (page, limit) => ReviewRepository.findAll(page, limit),

    createReview: (data) => ReviewRepository.create(data),

    deleteReview: async (id) => {
        const deleted = await ReviewRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy đánh giá để xóa');
        return deleted;
    },
};

module.exports = ReviewService;
