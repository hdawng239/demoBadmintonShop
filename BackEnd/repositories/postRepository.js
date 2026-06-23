const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/postModel');

// REPOSITORY = CHỈ chứa SQL thuần cho bảng posts.
const PostRepository = {
    findAll: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) FROM ${TABLE}`;
        let dataQuery = `SELECT * FROM ${TABLE}`;
        const countParams = [];
        const dataParams = [limit, offset];

        if (search) {
            countQuery += ' WHERE title ILIKE $1';
            dataQuery += ' WHERE title ILIKE $3';
            countParams.push(`%${search}%`);
            dataParams.push(`%${search}%`);
        }

        dataQuery += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);

        const result = await pool.query(dataQuery, dataParams);

        return { rows: result.rows.map(mapRow), totalItems };
    },

    findById: async (id) => {
        const result = await pool.query(
            `SELECT p.*, u.full_name AS author_name
             FROM ${TABLE} p
             LEFT JOIN users u ON p.author_id = u.id
             WHERE p.id = $1`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    create: async ({ author_id, title, slug, content, thumbnail_url }) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (author_id, title, slug, content, thumbnail_url)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [author_id, title, slug, content, thumbnail_url]
        );
        return mapRow(result.rows[0]);
    },

    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },
};

module.exports = PostRepository;
