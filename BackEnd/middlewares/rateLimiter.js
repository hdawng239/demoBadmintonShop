const rateLimit = require('express-rate-limit');
const PgRateLimitStore = require('../utils/pgRateLimitStore');
const shared = (prefix) => process.env.NODE_ENV === 'production' ? { store: new PgRateLimitStore(prefix) } : {};

const authLimiter = rateLimit({
    ...shared('login'),
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

const registerLimiter = rateLimit({
    ...shared('register'),
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Bạn đã tạo quá nhiều tài khoản. Vui lòng thử lại sau.' },
});

const passwordResetLimiter = rateLimit({
    ...shared('password'),
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Bạn đã thử khôi phục mật khẩu quá nhiều lần.' },
});

// Chạy sau xác thực; tách hạn mức gửi và xác nhận theo từng tài khoản.
const emailChangeLimit = (prefix, max, message) => rateLimit({
    ...shared(prefix),
    windowMs: 15 * 60 * 1000,
    max,
    keyGenerator: (req) => String(req.user.id),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const retryAfterSeconds = Math.max(1, Math.ceil(((req.rateLimit.resetTime?.getTime() || Date.now() + 900000) - Date.now()) / 1000));
        res.set('Retry-After', String(retryAfterSeconds));
        res.status(429).json({ success: false, message, retryAfterSeconds });
    },
});
const emailChangeRequestLimiter = emailChangeLimit('email-change-send', 5,
    'Bạn đã yêu cầu đổi email quá nhiều lần. Vui lòng chờ rồi thử lại.');
const emailChangeConfirmLimiter = emailChangeLimit('email-change-confirm', 10,
    'Bạn đã thử xác nhận email quá nhiều lần. Vui lòng chờ rồi thử lại.');

const expensiveOperationLimiter = rateLimit({
    ...shared('expensive'),
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Đã vượt giới hạn sử dụng tính năng này. Vui lòng thử lại sau.' },
});

const contactLimiter = rateLimit({
    ...shared('contact'),
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Bạn đã gửi quá nhiều lời nhắn. Vui lòng thử lại sau.' },
});

const globalLimiter = rateLimit({
    ...shared('global'),
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT || '500', 10),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'fail',
            message: 'Quá nhiều yêu cầu từ thiết bị của bạn. Vui lòng thử lại sau!',
        });
    },
});

const aiBudgetLimiter = rateLimit({
    ...shared('ai-budget'),
    windowMs: 60 * 60 * 1000,
    max: Number(process.env.AI_HOURLY_REQUEST_LIMIT || 200),
    keyGenerator: () => 'all-users',
    standardHeaders: true, legacyHeaders: false,
    message: { message: 'AI đã đạt giới hạn sử dụng trong giờ này. Vui lòng thử lại sau.' },
});

module.exports = {
    emailChangeRequestLimiter,
    emailChangeConfirmLimiter,
    aiBudgetLimiter,
    authLimiter,
    registerLimiter,
    passwordResetLimiter,
    expensiveOperationLimiter,
    contactLimiter,
    globalLimiter,
};
