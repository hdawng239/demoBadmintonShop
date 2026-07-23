const rateLimit = require('express-rate-limit');

// Siết chặt các route dễ bị dò mật khẩu (login, forgot-password...)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'fail',
            message: 'Bạn đã thử quá nhiều lần. Vui lòng đợi ít phút rồi thử lại!',
        });
    },
});

// Giới hạn chung cho toàn bộ API
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'fail',
            message: 'Quá nhiều yêu cầu từ thiết bị của bạn. Vui lòng thử lại sau!',
        });
    },
});

module.exports = { authLimiter, globalLimiter };
