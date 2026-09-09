const crypto = require('crypto');
const pool = require('../config/db');

// Dùng chung bộ đếm giữa các tiến trình backend.
class PgRateLimitStore {
    constructor(prefix) { this.prefix = `${prefix}:`; this.localKeys = false; }
    init(options) { this.windowMs = options.windowMs; }
    key(value) { return this.prefix + crypto.createHash('sha256').update(value).digest('hex'); }
    async increment(key) {
        const result = await pool.query(`INSERT INTO api_rate_limits (key, hits, reset_at)
            VALUES ($1, 1, NOW() + $2 * INTERVAL '1 millisecond')
            ON CONFLICT (key) DO UPDATE SET
                hits = CASE WHEN api_rate_limits.reset_at <= NOW() THEN 1 ELSE api_rate_limits.hits + 1 END,
                reset_at = CASE WHEN api_rate_limits.reset_at <= NOW() THEN EXCLUDED.reset_at ELSE api_rate_limits.reset_at END
            RETURNING hits, reset_at`, [this.key(key), this.windowMs]);
        return { totalHits: result.rows[0].hits, resetTime: new Date(result.rows[0].reset_at) };
    }
    async decrement(key) { await pool.query('UPDATE api_rate_limits SET hits = GREATEST(hits - 1, 0) WHERE key = $1', [this.key(key)]); }
    async resetKey(key) { await pool.query('DELETE FROM api_rate_limits WHERE key = $1', [this.key(key)]); }
}
module.exports = PgRateLimitStore;
