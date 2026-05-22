const Review = require('../models/reviewModel');

const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.getByProductId(req.params.productId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const createReview = async (req, res) => {
    try {
        const newReview = await Review.create(req.body);
        res.status(201).json({ message: "Gửi đánh giá thành công!", data: newReview });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const deleted = await Review.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy đánh giá để xóa" });
        res.status(200).json({ message: "Đã xóa đánh giá thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

module.exports = { getProductReviews, createReview, deleteReview };