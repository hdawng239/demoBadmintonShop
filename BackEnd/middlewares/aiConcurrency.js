const pool = require('../config/db');
// Khóa tự giải phóng khi giao dịch kết thúc hoặc kết nối DB bị ngắt.
module.exports = async (req, res, next) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        let acquired = false;
        for (let slot = 0; slot < 4; slot++) {
            const result = await client.query('SELECT pg_try_advisory_xact_lock(20260907, $1) AS acquired', [100 + slot]);
            if (result.rows[0].acquired) { acquired = true; break; }
        }
        if (!acquired) {
            await client.query('ROLLBACK'); client.release(); client = null;
            return res.status(503).json({ message: 'AI đang bận. Vui lòng thử lại sau.' });
        }
        let released = false;
        let leaseTimer;
        const release = () => {
            if (released) return;
            released = true;
            clearTimeout(leaseTimer);
            client.query('ROLLBACK').catch(() => {}).finally(() => client.release());
        };
        res.once('finish', release);
        // Giữ khóa đến hết thời hạn vì client ngắt kết nối không dừng lệnh gọi Gemini.
        leaseTimer = setTimeout(release, 45000);
        leaseTimer.unref();
        next();
    } catch (err) {
        if (client) { await client.query('ROLLBACK').catch(() => {}); client.release(); }
        next(err);
    }
};
