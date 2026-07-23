const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`));
};

// Mọi lỗi từ controller đổ về đây, không trả chi tiết lỗi hệ thống cho client
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Lỗi trùng key / sai khóa ngoại của Postgres
    if (err.code === '23505') {
        return res.status(409).json({ success: false, status: 'fail', message: 'Dữ liệu bị trùng lặp.' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ success: false, status: 'fail', message: 'Dữ liệu tham chiếu không hợp lệ.' });
    }

    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error('[ERROR]', err);
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode >= 500 ? 'error' : 'fail',
        message: err.isOperational ? err.message : 'Lỗi hệ thống',
    });
};

module.exports = { notFoundHandler, errorHandler };
