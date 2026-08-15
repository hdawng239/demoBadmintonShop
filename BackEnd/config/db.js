const { Pool } = require('pg');
require('dotenv').config();

const isRemote = process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    ssl: isRemote ? { rejectUnauthorized: false } : false,
    options: '-c search_path=public',
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