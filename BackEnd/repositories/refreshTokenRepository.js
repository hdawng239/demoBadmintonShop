const pool = require('../config/db');
const { TABLE, mapRow } = require('../models/refreshTokenModel');

const RefreshTokenRepository = {
    create: async (userId, tokenHash, expiresAt) => {
        const result = await pool.query(
            `INSERT INTO ${TABLE} (user_id, token_hash, expires_at)
             VALUES ($1, $2, $3) RETURNING *`,
            [userId, tokenHash, expiresAt]
        );
        return mapRow(result.rows[0]);
    },

    findByHash: async (tokenHash) => {
        const result = await pool.query(
            `SELECT * FROM ${TABLE} WHERE token_hash = $1`,
            [tokenHash]
        );
        return mapRow(result.rows[0]);
    },

    revokeByHash: async (tokenHash) => {
        const result = await pool.query(
            `UPDATE ${TABLE} SET revoked = TRUE WHERE token_hash = $1 RETURNING id`,
            [tokenHash]
        );
        return result.rows[0];
    },

    consumeByHash: async (tokenHash) => {
        const result = await pool.query(
            `UPDATE ${TABLE}
             SET revoked = TRUE
             WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()
             RETURNING *`,
            [tokenHash]
        );
        return mapRow(result.rows[0]);
    },

    revokeAllByUser: async (userId) => {
        const result = await pool.query(
            `UPDATE ${TABLE} SET revoked = TRUE WHERE user_id = $1 AND revoked = FALSE RETURNING id`,
            [userId]
        );
        return result.rows;
    },

    deleteExpired: async () => {
        const result = await pool.query(
            `DELETE FROM ${TABLE} WHERE expires_at < NOW() OR revoked = TRUE RETURNING id`
        );
        return result.rows;
    },
};

module.exports = RefreshTokenRepository;
