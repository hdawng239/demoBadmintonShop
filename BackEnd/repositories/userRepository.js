const pool = require('../config/db');
const { generateDynamicUpdate } = require('../utils/queryBuilder');
const { TABLE, UPDATABLE_FIELDS, mapRow, mapRowInternal } = require('../models/userModel');

const UserRepository = {
    findAuthState: async (id) => {
        const result = await pool.query('SELECT id, role, auth_version FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
        return result.rows[0] || null;
    },
    findPaginated: async (page = 1, limit = 10, search = '') => {
        const offset = (page - 1) * limit;

        let countQuery = `SELECT COUNT(*) FROM ${TABLE} WHERE deleted_at IS NULL`;
        let dataQuery = `
            SELECT id, full_name, email, role, phone, address, created_at
            FROM ${TABLE}
            WHERE deleted_at IS NULL
        `;
        const countParams = [];
        const dataParams = [];

        if (search && search.trim() !== '') {
            countQuery += ' AND (full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)';
            dataQuery += ' AND (full_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)';
            countParams.push(`%${search.trim()}%`);
            dataParams.push(`%${search.trim()}%`);
        }

        const paramIdx = dataParams.length;
        dataQuery += ` ORDER BY id ASC LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}`;
        dataParams.push(limit, offset);

        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const result = await pool.query(dataQuery, dataParams);

        return {
            data: result.rows.map(mapRow),
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
            `SELECT id, full_name, email, role, phone, address, created_at FROM ${TABLE} WHERE id = $1 AND deleted_at IS NULL`,
            [id]
        );
        return mapRow(result.rows[0]);
    },

    findByIdInternal: async (id) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1 AND deleted_at IS NULL`, [id]);
        return mapRowInternal(result.rows[0]);
    },

    findByEmail: async (email) => {
        const result = await pool.query(`SELECT * FROM ${TABLE} WHERE email = $1 AND deleted_at IS NULL`, [email]);
        return mapRowInternal(result.rows[0]);
    },

    findByIdentifier: async (identifier) => {
        const result = await pool.query(
            `SELECT * FROM ${TABLE} WHERE (email = $1 OR phone = $1) AND deleted_at IS NULL`,
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
        const securityChange = data.password_hash !== undefined || data.role !== undefined;
        const sql = query.replace(' WHERE id =', `${securityChange ? ', auth_version = auth_version + 1' : ''} WHERE deleted_at IS NULL AND id =`);
        const result = await pool.query(sql, values);
        return mapRow(result.rows[0]);
    },

    remove: async (id, deletedPasswordHash) => {
        const result = await pool.query(
            `UPDATE ${TABLE}
             SET full_name = 'Tài khoản đã xóa',
                 email = 'deleted+' || id || '@example.invalid',
                 phone = NULL,
                 address = NULL,
                 password_hash = $2,
                 otp_code = NULL,
                 otp_expires = NULL,
                 deleted_at = NOW(), auth_version = auth_version + 1
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING id, full_name, email`,
            [id, deletedPasswordHash]
        );
        return mapRow(result.rows[0]);
    },

    updateOTP: async (email, otp, expires) => {
        const result = await pool.query(
            `UPDATE ${TABLE}
             SET otp_code = $1, otp_expires = $2, otp_attempts = 0, otp_last_sent_at = NOW()
             WHERE email = $3 RETURNING id`,
            [otp, expires, email]
        );
        return result.rows[0];
    },

    clearOTP: async (email) => {
        await pool.query(
            `UPDATE ${TABLE} SET otp_code = NULL, otp_expires = NULL, otp_attempts = 0 WHERE email = $1`,
            [email]
        );
    },

    consumeOTPAndResetPassword: async (email, otpHash, hashedPassword) => {
        const result = await pool.query(
            `UPDATE ${TABLE}
             SET password_hash = $1, otp_code = NULL, otp_expires = NULL, otp_attempts = 0, auth_version = auth_version + 1
             WHERE email = $2
               AND otp_code = $3
               AND otp_expires > NOW()
               AND otp_attempts < 5
               AND deleted_at IS NULL
             RETURNING id`,
            [hashedPassword, email, otpHash]
        );
        return result.rows[0] || null;
    },

    recordFailedOTPAttempt: async (email) => {
        await pool.query(
            `UPDATE ${TABLE}
             SET otp_attempts = otp_attempts + 1,
                 otp_code = CASE WHEN otp_attempts + 1 >= 5 THEN NULL ELSE otp_code END,
                 otp_expires = CASE WHEN otp_attempts + 1 >= 5 THEN NULL ELSE otp_expires END
             WHERE email = $1`,
            [email]
        );
    },

};

module.exports = UserRepository;
