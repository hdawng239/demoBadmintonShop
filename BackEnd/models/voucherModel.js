const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');

const Voucher = {
    getAll: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const countRes = await pool.query('SELECT COUNT(*) FROM vouchers');
        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const dataQuery = `
            SELECT * FROM vouchers 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const res = await pool.query(dataQuery, [limit, offset]);
        return {
            data: res.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit
            }
        };
    },

    getById: async (id) => {
        const res = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
        return res.rows[0] || null;
    },

    getByCode: async (code) => {
        const cleanCode = String(code).trim().toUpperCase();
        const res = await pool.query(
            'SELECT * FROM vouchers WHERE UPPER(code) = $1',
            [cleanCode]
        );
        return res.rows[0] || null;
    },

    getActiveVouchers: async () => {
        const query = `
            SELECT * FROM vouchers 
            WHERE is_active = true 
              AND NOW() BETWEEN start_date AND end_date 
              AND used_count < usage_limit
            ORDER BY created_at DESC
        `;
        const res = await pool.query(query);
        return res.rows;
    },

    create: async (data) => {
        const {
            code, description, discount_type, discount_value,
            min_order_value, max_discount, usage_limit,
            start_date, end_date, is_active
        } = data;

        const query = `
            INSERT INTO vouchers (
                code, description, discount_type, discount_value,
                min_order_value, max_discount, usage_limit,
                start_date, end_date, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            code.trim().toUpperCase(),
            description || '',
            discount_type, // 'fixed', 'percentage', 'shipping'
            parseFloat(discount_value),
            parseFloat(min_order_value || 0),
            max_discount ? parseFloat(max_discount) : null,
            parseInt(usage_limit || 1),
            new Date(start_date),
            new Date(end_date),
            is_active !== undefined ? is_active : true
        ];

        const res = await pool.query(query, values);
        return res.rows[0];
    },

    update: async (id, data) => {
        // Normalize fields if they are in data
        const updatedData = { ...data };
        if (updatedData.code) updatedData.code = updatedData.code.trim().toUpperCase();
        if (updatedData.discount_value !== undefined) updatedData.discount_value = parseFloat(updatedData.discount_value);
        if (updatedData.min_order_value !== undefined) updatedData.min_order_value = parseFloat(updatedData.min_order_value);
        if (updatedData.max_discount !== undefined) updatedData.max_discount = updatedData.max_discount ? parseFloat(updatedData.max_discount) : null;
        if (updatedData.usage_limit !== undefined) updatedData.usage_limit = parseInt(updatedData.usage_limit);
        if (updatedData.start_date !== undefined) updatedData.start_date = new Date(updatedData.start_date);
        if (updatedData.end_date !== undefined) updatedData.end_date = new Date(updatedData.end_date);

        const { query, values } = generateDynamicUpdate('vouchers', updatedData, id);
        if (!query) throw new Error("Không có dữ liệu để cập nhật");

        const res = await pool.query(query, values);
        return res.rows[0];
    },

    delete: async (id) => {
        const res = await pool.query('DELETE FROM vouchers WHERE id = $1 RETURNING *', [id]);
        return res.rows[0];
    },

    incrementUsedCount: async (client, code) => {
        const query = `
            UPDATE vouchers 
            SET used_count = used_count + 1 
            WHERE UPPER(code) = UPPER($1) 
            RETURNING *
        `;
        const res = await client.query(query, [code]);
        return res.rows[0];
    }
};

module.exports = Voucher;
