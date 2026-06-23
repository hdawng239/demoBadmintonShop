const AppError = require('../utils/AppError');

// Bắt mọi route không khớp -> trả 404 thống nhất.
const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`));
};

// Error handler TẬP TRUNG: mọi lỗi từ controller (qua asyncHandler -> next(err)) đổ về đây.
// Tránh lặp try/catch và tránh rò rỉ chi tiết lỗi hệ thống ra client.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Map một số mã lỗi PostgreSQL phổ biến sang HTTP status thân thiện.
    if (err.code === '23505') {
        return res.status(409).json({ status: 'fail', message: 'Dữ liệu bị trùng lặp.' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ status: 'fail', message: 'Dữ liệu tham chiếu không hợp lệ.' });
    }

    const statusCode = err.statusCode || 500;

    // Lỗi 5xx là bug/sự cố hệ thống -> log lại để debug, không trả chi tiết cho client.
    if (statusCode >= 500) {
        console.error('[ERROR]', err);
    }

    res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message: err.isOperational ? err.message : 'Lỗi hệ thống',
    });
};

module.exports = { notFoundHandler, errorHandler };
