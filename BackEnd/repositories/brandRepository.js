const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/brandModel');

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
        if (!query) return null;
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(result.rows[0]);
    },
};

module.exports = BrandRepository;
