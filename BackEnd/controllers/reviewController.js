const Review = require('../models/reviewModel');

const getProductReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const reviewsData = await Review.getByProductId(req.params.productId, page, limit);
        res.status(200).json(reviewsData);
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const reviewsData = await Review.getAll(page, limit);
        res.status(200).json(reviewsData);
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

module.exports = { getProductReviews, createReview, deleteReview, getAllReviews };