const pool = require('../config/db');

const Review = {
    getByProductId: async (productId, page, limit) => {
        const offset = (page - 1) * limit;
        
        const countResult = await pool.query('SELECT COUNT(*) FROM reviews WHERE product_id = $1', [productId]);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as reviewer_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [productId, limit, offset]);
        
        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        };
    },
    
    // Lấy toàn bộ đánh giá (Dành cho Admin)
    getAll: async (page, limit) => {
        const offset = (page - 1) * limit;
        
        const countResult = await pool.query('SELECT COUNT(*) FROM reviews');
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as reviewer_name, p.name as product_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);
        
        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        };
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