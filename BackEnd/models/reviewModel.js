const pool = require('../config/db');

const Review = {
    // Lấy tất cả đánh giá của một sản phẩm cụ thể
    getByProductId: async (productId) => {
        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as reviewer_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC
        `;
        const result = await pool.query(query, [productId]);
        return result.rows;
    },
    
    // Tạo đánh giá mới
    create: async (data) => {
        const { user_id, product_id, rating, comment } = data;
        const query = `
            INSERT INTO reviews (user_id, product_id, rating, comment)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await pool.query(query, [user_id, product_id, rating, comment]);
        return result.rows[0];
    },

    // Xóa đánh giá (Dành cho Admin hoặc chính chủ xóa)
    delete: async (id) => {
        const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Review;