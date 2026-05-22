const validateReviewCreate = (data) => {
    const errors = [];
    if (!data.user_id) errors.push("Thiếu mã người dùng (user_id)");
    if (!data.product_id) errors.push("Thiếu mã sản phẩm (product_id)");
    if (!data.rating || data.rating < 1 || data.rating > 5) {
        errors.push("Số sao đánh giá (rating) phải từ 1 đến 5");
    }
    if (data.comment && data.comment.trim() === "") {
        errors.push("Bình luận không được chỉ chứa khoảng trắng");
    }
    return errors;
};

module.exports = { validateReviewCreate };