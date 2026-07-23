const pool = require('../config/db');
const { TABLE } = require('../models/wishlistModel');

const WishlistRepository = {
    // JOIN sang products để lấy thông tin hiển thị mới nhất
    findByUser: async (userId) => {
        const query = `
            SELECT p.*, b.name AS brand_name, c.name AS category_name,
                   w.created_at AS favorited_at
            FROM ${TABLE} w
            JOIN products p ON w.product_id = p.id
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    // Chỉ lấy product_id, dùng để FE tô tim / đếm nhanh
    findProductIdsByUser: async (userId) => {
        const result = await pool.query(
            `SELECT product_id FROM ${TABLE} WHERE user_id = $1`,
            [userId]
        );
        return result.rows.map((r) => r.product_id);
    },

    add: async (userId, productId) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (user_id, product_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, product_id) DO NOTHING
             RETURNING *`,
            [userId, productId]
        );
        // null nếu đã tồn tại từ trước
        return result.rows[0] || null;
    },

    remove: async (userId, productId) => {
        const result = await pool.query(
            `DELETE FROM ${TABLE} WHERE user_id = $1 AND product_id = $2 RETURNING id`,
            [userId, productId]
        );
        return result.rows[0] || null;
    },

    exists: async (userId, productId) => {
        const result = await pool.query(
            `SELECT 1 FROM ${TABLE} WHERE user_id = $1 AND product_id = $2`,
            [userId, productId]
        );
        return result.rowCount > 0;
    },

    countByUser: async (userId) => {
        const result = await pool.query(
            `SELECT COUNT(*) FROM ${TABLE} WHERE user_id = $1`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },
};

module.exports = WishlistRepository;
