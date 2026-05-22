const pool = require('../config/db');

const Comment = {
    create: async (data) => {
        const { post_id, user_id, content, image_url } = data;
        const query = `INSERT INTO post_comments (post_id, user_id, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [post_id, user_id, content, image_url || null]);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM post_comments WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Comment;