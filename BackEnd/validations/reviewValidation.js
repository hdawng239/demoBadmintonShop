const validateReviewCreate = (data) => {
    const errors = [];
    const productId = Number(data.product_id);
    if (!Number.isInteger(productId) || productId <= 0) errors.push("Mã sản phẩm (product_id) không hợp lệ");
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.push("Số sao đánh giá (rating) phải từ 1 đến 5");
    }
    if (data.comment !== undefined && typeof data.comment !== 'string') {
        errors.push('Bình luận phải là chuỗi');
    } else if (data.comment && data.comment.trim() === "") {
        errors.push("Bình luận không được chỉ chứa khoảng trắng");
    }
    if (data.comment && data.comment.length > 2000) errors.push('Bình luận không được vượt quá 2000 ký tự');
    return errors;
};

module.exports = { validateReviewCreate };
