const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow } = require('../models/voucherModel');

const VoucherRepository = {
    findAll: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const countRes = await pool.query(`SELECT COUNT(*) FROM ${TABLE}`);
        const totalItems = parseInt(countRes.rows[0].count);

        const res = await pool.query(
            `SELECT * FROM ${TABLE} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return { rows: res.rows.map(mapRow), totalItems };
    },

    findById: async (id) => {
        const res = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return mapRow(res.rows[0]);
    },

    findByCode: async (code) => {
        const cleanCode = String(code).trim().toUpperCase();
        const res = await pool.query(`SELECT * FROM ${TABLE} WHERE UPPER(code) = $1`, [cleanCode]);
        return mapRow(res.rows[0]);
    },

    findActive: async () => {
        const res = await pool.query(
            `SELECT * FROM ${TABLE}
             WHERE is_active = true
               AND NOW() BETWEEN start_date AND end_date
               AND used_count < usage_limit
             ORDER BY created_at DESC`
        );
        return res.rows.map(mapRow);
    },

    create: async (v) => {
        const res = await pool.query(
            `INSERT INTO ${TABLE} (
                code, description, discount_type, discount_value,
                min_order_value, max_discount, usage_limit,
                start_date, end_date, is_active
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [
                v.code, v.description, v.discount_type, v.discount_value,
                v.min_order_value, v.max_discount, v.usage_limit,
                v.start_date, v.end_date, v.is_active,
            ]
        );
        return mapRow(res.rows[0]);
    },

    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const res = await pool.query(query, values);
        return mapRow(res.rows[0]);
    },

    remove: async (id) => {
        const res = await pool.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING *`, [id]);
        return mapRow(res.rows[0]);
    },

    // Gọi trong transaction đặt hàng, nhận client của transaction
    incrementUsedCount: async (client, code) => {
        const res = await client.query(
            `UPDATE ${TABLE} SET used_count = used_count + 1 WHERE UPPER(code) = UPPER($1) RETURNING *`,
            [code]
        );
        return res.rows[0];
    },
};

module.exports = VoucherRepository;
