const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/postModel');

// REPOSITORY = CHỈ chứa SQL thuần cho bảng posts.
const PostRepository = {
    findAll: async (page = 1, limit = 10, search = '', publishedOnly = false) => {
        const offset = (page - 1) * limit;

        let conditions = [];
        let params = [];
        let paramIdx = 1;

        if (publishedOnly) {
            conditions.push(`p.is_published = true`);
        }

        if (search) {
            conditions.push(`p.title ILIKE $${paramIdx}`);
            params.push(`%${search}%`);
            paramIdx++;
        }

        const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) FROM ${TABLE} p ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        const dataParams = [...params, limit, offset];
        const dataQuery = `
            SELECT p.*, u.full_name AS author_name
            FROM ${TABLE} p
            LEFT JOIN users u ON p.author_id = u.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;

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

    create: async ({ author_id, title, slug, summary, content, thumbnail_url, is_published }) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (author_id, title, slug, summary, content, thumbnail_url, is_published)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                author_id || null, 
                title, 
                slug, 
                summary || null, 
                content, 
                thumbnail_url || null, 
                is_published !== undefined ? is_published : true
            ]
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
