const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const Brand = {
    getAll: async () => {
        const result = await pool.query('SELECT * FROM brands ORDER BY id ASC');
        return result.rows;
    },
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);
        return result.rows[0];
    },
    create: async (data) => {
        const { name, logo_url, description } = data;
        const query = `
            INSERT INTO brands (name, logo_url, description) 
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [name, logo_url || null, description || null]);
        return result.rows[0];
    },
    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate('brands', data, id);
        if (!query) throw new Error("Không có dữ liệu hợp lệ để cập nhật");
        
        const result = await pool.query(query, values);
        return result.rows[0];
    },
    delete: async (id) => {
        const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};

module.exports = Brand;