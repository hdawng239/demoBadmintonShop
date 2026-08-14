const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow, mapRowInternal } = require('../models/userModel');

const UserRepository = {
    findPaginated: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) FROM ${TABLE}`;
        let dataQuery = `
            SELECT id, full_name, email, role, phone, address, created_at
            FROM ${TABLE}
        `;
        const countParams = [];
        const dataParams = [limit, offset];

        if (search) {
            countQuery += ' WHERE full_name ILIKE $1 OR email ILIKE $1';
            dataQuery += ' WHERE full_name ILIKE $3 OR email ILIKE $3';
            countParams.push(`%${search}%`);
            dataParams.push(`%${search}%`);
        }

        dataQuery += ' ORDER BY id ASC LIMIT $1 OFFSET $2';

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const result = await pool.query(dataQuery, dataParams);

        return {
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
            },
        };
    },

    findById: async (id) => {
        const result = await pool.query(
            `SELECT id, full_name, email, role, phone, address, created_at FROM ${TABLE} WHERE id = $1`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    // Trả cả password_hash để xác thực đổi mật khẩu
    findByIdInternal: async (id) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
        return mapRowInternal(result.rows[0]);
    },

    // Trả cả password_hash để auth so sánh mật khẩu
    findByEmail: async (email) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE email = $1`, [email]);
        return mapRowInternal(result.rows[0]);
    },

    // Login bằng email hoặc số điện thoại
    findByIdentifier: async (identifier) => {
        const result = await pool.query(
            `SELECT * FROM ${TABLE} WHERE email = $1 OR phone = $1`,
            [identifier]
        );
        return mapRowInternal(result.rows[0]);
    },

    create: async ({ full_name, email, password, role, phone, address }) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (full_name, email, password_hash, role, phone, address)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, role`,
            [full_name, email, password, role || 'customer', phone, address]
        );
        return result.rows[0];
    },

    update: async (id, data) => {
        const { query, values } = generateDynamicUpdate(TABLE, data, id, UPDATABLE_FIELDS);
        if (!query) return null;
        const result = await pool.query(query, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id) => {
        const result = await pool.query(
            `DELETE FROM ${TABLE} WHERE id = $1 RETURNING id, full_name, email`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    updateOTP: async (email, otp, expires) => {
        const result = await pool.query(
            `UPDATE ${TABLE} SET otp_code = $1, otp_expires = $2 WHERE email = $3 RETURNING id`,
            [otp, expires, email]
        );
        return result.rows[0];
    },

    resetPasswordWithOTP: async (email, hashedPassword) => {
        const result = await pool.query(
            `UPDATE ${TABLE} SET password_hash = $1, otp_code = NULL, otp_expires = NULL WHERE email = $2 RETURNING id`,
            [hashedPassword, email]
        );
        return result.rows[0];
    },
};

module.exports = UserRepository;
