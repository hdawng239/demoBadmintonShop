const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/brandModel');

// REPOSITORY = tầng truy cập dữ liệu: CHỈ chứa SQL thuần cho bảng brands.
// Không chứa business logic, không xử lý req/res.
const BrandRepository = {
    findAll: async () => {
        const result = await pool.query(`SELECT * FROM ${TABLE} ORDER BY id ASC`);
        return result.rows.map(mapRow);
    },

    findById: async (id) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return mapRow(result.rows[0]);
    },

    create: async ({ name, logo_url, description }) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (name, logo_url, description) VALUES ($1, $2, $3) RETURNING *`,
            [name, logo_url || null, description || null]
        );
        return mapRow(result.rows[0]);
    },

    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null; // không có cột hợp lệ để cập nhật
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },
};

module.exports = BrandRepository;
