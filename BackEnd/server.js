const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();

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

// ── Bảo mật ──────────────────────────────────────────────
const helmet = require('helmet');
app.use(helmet()); // gắn ~12 HTTP security header (chống clickjacking, ẩn X-Powered-By...)

// CORS: chỉ cho phép các origin trong FRONTEND_URL (danh sách ngăn cách bởi dấu phẩy).
// Nếu không cấu hình -> cho phép tất cả (tiện cho dev), nên set ở production.
const cors = require('cors');
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
    : null;
app.use(cors({
    origin: (origin, callback) => {
        // Cho phép request không có origin (Postman, server-to-server...) hoặc khi không set FRONTEND_URL
        if (!origin || !allowedOrigins || allowedOrigins.includes('*')) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (
            allowedOrigins.includes(cleanOrigin) ||
            cleanOrigin.includes('vercel.app') ||
            cleanOrigin.includes('localhost') ||
            cleanOrigin.includes('127.0.0.1')
        ) {
            return callback(null, true);
        }
        return callback(new Error('Không được phép bởi CORS: ' + origin));
    },
    credentials: true,
}));

app.use(express.json());

// Rate limit toàn cục cho mọi API (chống lạm dụng chung).
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

// 404 cho route không tồn tại + error handler tập trung (phải đặt SAU tất cả route).
app.use(notFoundHandler);
app.use(errorHandler);

// Tự động quét và hủy các đơn hàng QR quá hạn 2 phút chưa thanh toán
setInterval(async () => {
    try {
        const OrderService = require('./services/orderService');
        await OrderService.cancelExpiredQROrders();
    } catch (err) {
        console.error("Lỗi trong quá trình tự động quét hủy đơn hàng QR quá hạn:", err);
    }
}, 30000); // Chạy mỗi 30 giây

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});