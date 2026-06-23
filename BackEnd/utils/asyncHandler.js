// Bọc một controller async để mọi lỗi (throw / promise reject) tự động được
// chuyển sang error middleware tập trung qua next(err).
// Nhờ vậy controller KHÔNG cần lặp try/catch ở từng hàm.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
