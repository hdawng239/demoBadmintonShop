require('dotenv').config({ quiet: true });
const express = require('express');
const cookieParser = require('cookie-parser');
const { validateEnvironment } = require('./config/env');

validateEnvironment();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const postRoutes = require('./routes/postRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
const ghnRoutes = require('./routes/ghnRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sepayRoutes = require('./routes/sepayRoutes');
const chatRoutes = require('./routes/chatRoutes');
const variantRoutes = require('./routes/variantRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const contactRoutes = require('./routes/contactRoutes');

const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { globalLimiter } = require('./middlewares/rateLimiter');

const helmet = require('helmet');
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet());
const cors = require('cors');
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
    : null;
app.use(cors({
    origin: (origin, callback) => {
        // Cho phép gọi server-to-server; trình duyệt phải đúng origin đã cấu hình.
        if (!origin) return callback(null, true);
        if (!allowedOrigins) return callback(null, process.env.NODE_ENV !== 'production');
        const cleanOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(cleanOrigin)) return callback(null, true);
        const error = new Error('Origin không được phép truy cập API.');
        error.statusCode = 403;
        error.isOperational = true;
        return callback(error);
    },
    credentials: true,
}));

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '5mb' }));
app.use(cookieParser());
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || Array.isArray(req.body) || typeof req.body !== 'object')) {
        return res.status(400).json({ success: false, status: 'fail', message: 'Request body phải là JSON object hợp lệ.' });
    }
    next();
});

app.use('/api', globalLimiter);

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ghn', ghnRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sepay', sepayRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
    res.json({ status: "ok", message: "API is running" });
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'ok' });
    } catch (_) {
        res.status(503).json({ status: 'error', database: 'unavailable' });
    }
});

app.use(notFoundHandler);
app.use(errorHandler);

const orderCleanupTimer = setInterval(async () => {
    try {
        const OrderService = require('./services/orderService');
        await OrderService.cancelExpiredQROrders();
    } catch (err) {
        console.error('[Order cleanup]', { name: err.name, code: err.code });
    }
}, 30000);
orderCleanupTimer.unref();
const housekeepingTimer = setInterval(async () => {
    try {
        await pool.query('DELETE FROM api_rate_limits WHERE reset_at < NOW()');
        await pool.query('DELETE FROM email_changes WHERE expires_at < NOW()');
        await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    } catch (err) { console.error('[Housekeeping]', { name: err.name, code: err.code }); }
}, 60 * 60 * 1000);
housekeepingTimer.unref();

let server;
const startServer = async () => {
    await pool.query('SELECT 1');
    try {
        await pool.query(`
            SELECT auth_version, otp_attempts, otp_last_sent_at, deleted_at FROM users LIMIT 0;
            SELECT shipping_fee, shipping_discount, paid_at, archived_at,
                   shipping_requested, shipping_client_code FROM orders LIMIT 0;
            SELECT user_id, token_hash, auth_version, attempts, expires_at FROM email_changes LIMIT 0;
            SELECT order_id, actor_id, reference, amount, method FROM payment_receipts LIMIT 0;
            SELECT provider_event_id, payload_hash, status FROM payment_events LIMIT 0;
            SELECT key, hits, reset_at FROM api_rate_limits LIMIT 0;
        `);
    } catch (error) {
        if (['42P01', '42703'].includes(error.code)) {
            throw new Error('Database thiếu bảng/cột cần thiết. Hãy kết nối đúng database của project đã có schema hiện tại.');
        }
        throw error;
    }
    console.log('Đã kết nối Database thành công!');
    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = (signal) => {
        console.log(`${signal}: đang đóng server an toàn...`);
        clearInterval(orderCleanupTimer);
        clearInterval(housekeepingTimer);
        server.close(async () => {
            await pool.end();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

if (require.main === module) {
    startServer().catch(async (error) => {
        console.error('Không thể khởi động server vì database không sẵn sàng:', error.message);
        await pool.end().catch(() => {});
        process.exit(1);
    });
}

module.exports = app;
