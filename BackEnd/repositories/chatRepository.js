const pool = require('../config/db');

const ChatRepository = {
    logMessage: async (sessionId, userId, senderType, message) => {
        await pool.query(
            'INSERT INTO chat_logs (session_id, user_id, sender_type, message) VALUES ($1, $2, $3, $4)',
            [sessionId, userId, senderType, message]
        );
    },

    getProductCatalog: async () => {
        const res = await pool.query(
            'SELECT name, base_price FROM products WHERE is_active = true ORDER BY id DESC LIMIT 500'
        );
        if (res.rows.length > 0) {
            return res.rows
                .map((p) => `- ${p.name}: ${parseInt(p.base_price).toLocaleString('vi-VN')} VNĐ`)
                .join('\n');
        }
        return '';
    },
};

module.exports = ChatRepository;
