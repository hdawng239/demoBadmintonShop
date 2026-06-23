const OrderService = require('../services/orderService');
require('dotenv').config();

const handleSepayWebhook = async (req, res) => {
    try {
        // Verify API Key
        const apiKey = req.headers['authorization']?.replace('Apikey ', '')?.replace('Bearer ', '')
            || req.headers['x-api-key']
            || req.headers['apikey']
            || req.query.apikey;

        if (apiKey !== process.env.KEY_SEPAY) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
        }

        const { content, code, transferType, transferAmount } = req.body;

        if (transferType !== 'in') {
            return res.status(200).json({ success: true, message: 'Not an incoming transfer, ignored' });
        }

        // Extract Order ID from content/code (format: DH<number>)
        let orderId = null;
        const match = (content && content.match(/DH(\d+)/i)) || (code && code.match(/DH(\d+)/i)) || (code && code.match(/\d+/));

        if (match && match[1]) {
            orderId = parseInt(match[1]);
        } else if (match && match[0]) {
            orderId = parseInt(match[0].replace(/\D/g, ''));
        }

        if (!orderId) {
            return res.status(200).json({ success: true, message: 'Could not find Order ID in transaction content' });
        }

        const result = await OrderService.handleSepayPayment(orderId, transferAmount);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        if (error.isOperational) {
            return res.status(200).json({ success: true, message: error.message });
        }
        console.error('SEPAY Webhook Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = { handleSepayWebhook };
