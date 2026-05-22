const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'navishop',
    password: process.env.DB_PASSWORD || '123456', // Sửa lại đúng pass của bạn nhé
    port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Lỗi kết nối PostgreSQL:', err.stack);
    } else {
        console.log('✅ Đã kết nối Database thành công!');
    }
    if (client) release();
});

module.exports = pool;