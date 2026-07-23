// Bọc controller async để lỗi tự chuyển sang error middleware, khỏi try/catch từng hàm
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
