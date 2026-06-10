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

app.get('/', (req, res) => {
    res.json({ status: "ok", message: "API is running" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});