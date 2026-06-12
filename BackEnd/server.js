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

const cors = require('cors');
app.use(cors());

app.use(express.json());

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

app.get('/', (req, res) => {
    res.json({ status: "ok", message: "API is running" });
});

// Tự động quét và hủy các đơn hàng QR quá hạn 2 phút chưa thanh toán
setInterval(async () => {
    try {
        const Order = require('./models/orderModel');
        const pool = require('./config/db');
        
        // Tìm các đơn hàng thanh toán qua QR, chưa thanh toán (unpaid), đang chờ xử lý (pending)
        // và được tạo quá 2 phút trước (timezone-safe bằng cách so sánh trực tiếp trong DB).
        const expiredOrdersRes = await pool.query(
            `SELECT id FROM orders 
             WHERE LOWER(payment_method) = 'qr' 
               AND payment_status = 'unpaid' 
               AND status = 'pending' 
               AND created_at < NOW() - INTERVAL '2 minutes'`
        );
        
        for (const row of expiredOrdersRes.rows) {
            console.log(`[Auto-Cancel] Đơn hàng #${row.id} quá hạn 2 phút chưa thanh toán. Đang tự động hủy...`);
            await Order.cancelOrderById(row.id);
        }
    } catch (err) {
        console.error("Lỗi trong quá trình tự động quét hủy đơn hàng QR quá hạn:", err);
    }
}, 30000); // Chạy mỗi 30 giây

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});