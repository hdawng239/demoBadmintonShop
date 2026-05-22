const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const Post = {
    getAll: async (page, limit) => {
        const offset = (page - 1) * limit;
        
        const countResult = await pool.query('SELECT COUNT(*) FROM posts');
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataQuery = `
            SELECT * 
            FROM posts 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(dataQuery, [limit, offset]);
        
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
        // Lấy bài viết KÈM THEO tên của Admin (Tác giả)
        const postQuery = `
            SELECT p.*, u.full_name AS author_name 
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = $1
        `;
        const result = await pool.query(postQuery, [id]);
        const post = result.rows[0];
        
        if (post) {
            // Lấy danh sách bình luận KÈM THEO tên của User bình luận
            const commentQuery = `
                SELECT c.*, u.full_name AS commenter_name 
                FROM post_comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.post_id = $1 
                ORDER BY c.created_at DESC
            `;
            const comments = await pool.query(commentQuery, [id]);
            post.comments = comments.rows;
        }
        return post;
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