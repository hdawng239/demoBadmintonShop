const pool = require('../config/db');
const { TABLE, mapRow } = require('../models/reviewModel');

const ReviewRepository = {
    findByProductId: async (productId, page, limit) => {
        const offset = (page - 1) * limit;

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM ${TABLE} WHERE product_id = $1`,
            [productId]
        );
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS reviewer_name
            FROM ${TABLE} r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [productId, limit, offset]);

        return {
            data: result.rows,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    },

    findAll: async (page, limit) => {
        const offset = (page - 1) * limit;

        const countResult = await pool.query(`SELECT COUNT(*) FROM ${TABLE}`);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS reviewer_name, p.name AS product_name
            FROM ${TABLE} r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

        return {
            data: result.rows,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    },

    createVerified: async ({ user_id, product_id, rating, comment }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Khóa theo cặp người dùng/sản phẩm để tránh gửi đánh giá trùng đồng thời.
            await client.query('SELECT pg_advisory_xact_lock($1::integer, $2::integer)', [user_id, product_id]);

            const purchased = await client.query(
                `SELECT 1
                 FROM orders o
                 JOIN order_items oi ON oi.order_id = o.id
                 JOIN product_variants pv ON pv.id = oi.variant_id
                 WHERE o.user_id = $1 AND pv.product_id = $2 AND o.status = 'completed'
                 LIMIT 1`,
                [user_id, product_id]
            );
            if (!purchased.rowCount) {
                await client.query('ROLLBACK');
                return { reason: 'not_purchased' };
            }

            const existing = await client.query(
                `SELECT 1 FROM ${TABLE} WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
                [user_id, product_id]
            );
            if (existing.rowCount) {
                await client.query('ROLLBACK');
                return { reason: 'duplicate' };
            }

            const result = await client.query(
                `INSERT INTO ${TABLE} (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
                [user_id, product_id, rating, comment?.trim() || null]
            );
            await client.query('COMMIT');
            return { review: mapRow(result.rows[0]) };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },
};

module.exports = ReviewRepository;
