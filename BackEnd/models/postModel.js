const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const Post = {
    getAll: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;
        
        let countQuery = 'SELECT COUNT(*) FROM posts';
        let dataQuery = `
            SELECT * 
            FROM posts 
        `;
        let countParams = [];
        let dataParams = [limit, offset];

        if (search) {
            countQuery += ' WHERE title ILIKE $1';
            dataQuery += ' WHERE title ILIKE $3';
            countParams.push(`%${search}%`);
            dataParams.push(`%${search}%`);
        }

        dataQuery += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const result = await pool.query(dataQuery, dataParams);
        
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
    getById: async (id) => {
        const postQuery = `
            SELECT p.*, u.full_name AS author_name 
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = $1
        `;
        const result = await pool.query(postQuery, [id]);
        return result.rows[0];
    },
    create: async (data) => {
        const { author_id, title, slug, content, thumbnail_url } = data;
        const query = `INSERT INTO posts (author_id, title, slug, content, thumbnail_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await pool.query(query, [author_id, title, slug, content, thumbnail_url]);
        return result.rows[0];
    },
    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate('posts', data, id);
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");
        const result = await pool.query(query, values);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Post;