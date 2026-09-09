const OrderService = require('../services/orderService');
const crypto = require('crypto');

const safeEqual = (left, right) => {
    const a = Buffer.from(String(left || ''));
    const b = Buffer.from(String(right || ''));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const handleSepayWebhook = async (req, res) => {
    try {
        const apiKey = req.headers['authorization']?.replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '')
            || req.headers['x-api-key']
            || req.headers['apikey'];

        if (!process.env.KEY_SEPAY || !safeEqual(apiKey, process.env.KEY_SEPAY.trim())) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
        }

        const { content, code, transferType, transferAmount } = req.body;

        if (transferType !== 'in') {
            return res.status(200).json({ success: true, message: 'Not an incoming transfer, ignored' });
        }

        let orderId = null;
        const match = (typeof content === 'string' && content.match(/(?:NARO|NR|NB|DH)[-\s]?(\d+)/i))
                   || (typeof code === 'string' && code.match(/(?:NARO|NR|NB|DH)[-\s]?(\d+)/i));

        if (match && match[1]) {
            orderId = parseInt(match[1]);
        } else if (match && match[0]) {
            orderId = parseInt(match[0].replace(/\D/g, ''));
        }

        if (!orderId) {
            return res.status(200).json({ success: true, message: 'Could not find Order ID in transaction content' });
        }

        const amount = Number(transferAmount);
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return res.status(200).json({ success: true, accepted: false, message: 'Invalid transfer amount, ignored' });
        }

        const canonicalPayload = JSON.stringify({
            id: req.body.id,
            referenceCode: req.body.referenceCode,
            transactionDate: req.body.transactionDate,
            transferAmount: amount,
            content,
            code,
        });
        const payloadHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
        const eventId = String(req.body.id || req.body.referenceCode || payloadHash);
        const result = await OrderService.handleSepayPayment({
            orderId,
            amount,
            eventId,
            payloadHash,
            payload: { content, code, transferType, transferAmount: amount, transactionDate: req.body.transactionDate },
        });
        res.status(200).json({ success: true, accepted: result.processed, duplicate: !!result.duplicate, message: result.message });
    } catch (error) {
        // Xác nhận đã nhận lỗi nghiệp vụ để dừng retry, không ghi nhận thanh toán.
        if (error.isOperational && error.statusCode >= 400 && error.statusCode < 500) {
            console.warn('[SePay webhook rejected]', { status: error.statusCode, code: error.code });
            return res.status(200).json({
                success: true,
                accepted: false,
                message: 'Webhook đã nhận nhưng giao dịch cần đối soát thủ công.',
            });
        }

        // Trả 500 cho lỗi hệ thống để SePay gửi lại.
        console.error('[SePay webhook failed]', { name: error.name, code: error.code });
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { handleSepayWebhook };
