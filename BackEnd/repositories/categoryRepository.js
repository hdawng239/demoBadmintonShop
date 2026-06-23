const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/categoryModel');

// REPOSITORY = CHỈ chứa SQL thuần cho bảng categories.
const CategoryRepository = {
    findAll: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) FROM ${TABLE}`;
        let dataQuery = `
            SELECT c1.*, c2.name AS parent_name
            FROM ${TABLE} c1
            LEFT JOIN ${TABLE} c2 ON c1.parent_id = c2.id
        `;
        const countParams = [];
        const dataParams = [limit, offset];

        if (search) {
            countQuery += ' WHERE name ILIKE $1';
            dataQuery += ' WHERE c1.name ILIKE $3';
            countParams.push(`%${search}%`);
            dataParams.push(`%${search}%`);
        }

        dataQuery += ' ORDER BY c1.id ASC LIMIT $1 OFFSET $2';

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);

        const result = await pool.query(dataQuery, dataParams);

        return {
            rows: result.rows.map(mapRow),
            totalItems,
        };
    },

    findById: async (id) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return mapRow(result.rows[0]);
    },

    create: async ({ parent_id, name, slug }) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (parent_id, name, slug) VALUES ($1, $2, $3) RETURNING *`,
            [parent_id || null, name, slug]
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

module.exports = CategoryRepository;
