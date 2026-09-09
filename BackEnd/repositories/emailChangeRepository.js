const pool = require('../config/db');

module.exports = {
    request: async (userId, email, tokenHash, version) => {
        const result = await pool.query(`
            INSERT INTO email_changes (user_id, new_email, token_hash, auth_version, expires_at)
            SELECT id, $2, $3, auth_version, NOW() + INTERVAL '5 minutes'
            FROM users WHERE id = $1 AND auth_version = $4 AND deleted_at IS NULL
            ON CONFLICT (user_id) DO UPDATE SET new_email = EXCLUDED.new_email,
                token_hash = EXCLUDED.token_hash, auth_version = EXCLUDED.auth_version,
                attempts = 0, expires_at = EXCLUDED.expires_at, created_at = NOW()
            WHERE email_changes.created_at < NOW() - INTERVAL '60 seconds'
            RETURNING user_id`, [userId, email, tokenHash, version]);
        return result.rowCount > 0;
    },
    discard: (userId, tokenHash) => pool.query('DELETE FROM email_changes WHERE user_id = $1 AND token_hash = $2', [userId, tokenHash]),
    retryAfterSeconds: async (userId) => {
        const result = await pool.query(`SELECT GREATEST(1, CEIL(EXTRACT(EPOCH FROM
            (created_at + INTERVAL '60 seconds' - NOW()))))::int AS seconds
            FROM email_changes WHERE user_id = $1`, [userId]);
        return result.rows[0]?.seconds || 1;
    },
    confirm: async (userId, email, tokenHash, version) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const user = await client.query('SELECT auth_version FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE', [userId]);
            if (!user.rowCount || user.rows[0].auth_version !== version) {
                await client.query('ROLLBACK');
                return false;
            }
            const consumed = await client.query(`DELETE FROM email_changes
                WHERE user_id = $1 AND new_email = $2 AND token_hash = $3 AND auth_version = $4
                AND attempts < 5 AND expires_at > NOW() RETURNING user_id`, [userId, email, tokenHash, version]);
            if (!consumed.rowCount) {
                await client.query('UPDATE email_changes SET attempts = LEAST(attempts + 1, 5) WHERE user_id = $1', [userId]);
                await client.query('COMMIT');
                return false;
            }
            await client.query(`UPDATE users SET email = $2, auth_version = auth_version + 1,
                otp_code = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = $1`, [userId, email]);
            await client.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally { client.release(); }
    },
};
