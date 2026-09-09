const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
    next(new AppError(404, `Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err.code === '23505') {
        return res.status(409).json({ success: false, status: 'fail', message: 'Dữ liệu bị trùng lặp.' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ success: false, status: 'fail', message: 'Dữ liệu tham chiếu không hợp lệ.' });
    }
    if (['22P02', '22001', '23514'].includes(err.code)) {
        return res.status(400).json({ success: false, status: 'fail', message: 'Dữ liệu gửi lên không hợp lệ.' });
    }

    const statusCode = err.statusCode || 500;
    const retryAfterSeconds = statusCode === 429 && err.isOperational && Number.isSafeInteger(err.retryAfterSeconds)
        ? Math.max(1, err.retryAfterSeconds) : undefined;
    if (retryAfterSeconds) res.set('Retry-After', String(retryAfterSeconds));

    if (statusCode >= 500) {
        // Chỉ log thông tin an toàn, tránh lộ token trong cấu hình Axios.
        console.error('[ERROR]', { name: err.name, code: err.code, status: statusCode });
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode >= 500 ? 'error' : 'fail',
        message: err.isOperational ? err.message : 'Lỗi hệ thống',
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
    });
};

module.exports = { notFoundHandler, errorHandler };
