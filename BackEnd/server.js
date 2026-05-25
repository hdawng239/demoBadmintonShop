const express = require('express');
const app = express();
const PORT = 5000;

// Import các Routes
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

// Cấu hình Middleware CORS để Frontend có thể gọi API
const cors = require('cors');
app.use(cors());

// Cấu hình Middleware đọc dữ liệu JSON
app.use(express.json());

// Điều hướng các endpoint API chính thức
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

app.get('/', (req, res) => {
    res.json({ message: "Hệ thống E-Commerce chuẩn MVC đã sẵn sàng!" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server chuẩn kiến trúc MVC đang chạy tại http://localhost:${PORT}`);
});