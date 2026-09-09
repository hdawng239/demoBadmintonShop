const ReviewRepository = require('../repositories/reviewRepository');
const AppError = require('../utils/AppError');

const ReviewService = {
    getProductReviews: (productId, page, limit) =>
        ReviewRepository.findByProductId(productId, page, limit),

    getAllReviews: (page, limit) => ReviewRepository.findAll(page, limit),

    createReview: async (data) => {
        const result = await ReviewRepository.createVerified(data);
        if (result.reason === 'not_purchased') {
            throw new AppError(403, 'Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn thành.');
        }
        if (result.reason === 'duplicate') {
            throw new AppError(409, 'Bạn đã đánh giá sản phẩm này rồi.');
        }
        return result.review;
    },

    deleteReview: async (id) => {
        const deleted = await ReviewRepository.remove(id);
        if (!deleted) throw new AppError(404, 'Không tìm thấy đánh giá để xóa');
        return deleted;
    },
};

module.exports = ReviewService;
