const Order = require('../models/orderModel');
require('dotenv').config();

const handleSepayWebhook = async (req, res) => {
    try {
        // 1. Verify API Key
        // Sepay can send via query param or Authorization header
        const apiKey = req.headers['authorization']?.replace('Apikey ', '')?.replace('Bearer ', '') 
            || req.headers['x-api-key']
            || req.headers['apikey']
            || req.query.apikey;

        if (apiKey !== process.env.KEY_SEPAY) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid API Key" });
        }

        const { id, gateway, transactionDate, accountNumber, code, content, transferType, transferAmount, accumulated } = req.body;

        // We only care about money coming IN (transferType = "in")
        if (transferType !== 'in') {
            return res.status(200).json({ success: true, message: "Not an incoming transfer, ignored" });
        }

        // 2. Extract Order ID
        // Syntax is usually DH + Order ID (e.g. DH15)
        // Try to find it in 'content' or 'code'
        let orderId = null;
        const match = (content && content.match(/DH(\d+)/i)) || (code && code.match(/DH(\d+)/i)) || (code && code.match(/\d+/));
        
        if (match && match[1]) {
            orderId = parseInt(match[1]);
        } else if (match && match[0]) {
             orderId = parseInt(match[0].replace(/\D/g, ''));
        }

        if (!orderId) {
            return res.status(200).json({ success: true, message: "Could not find Order ID in transaction content" });
        }

        // 3. Verify Order & Amount
        const order = await Order.getById(orderId);
        if (!order) {
            return res.status(200).json({ success: true, message: "Order not found" });
        }

        if (order.payment_status === 'paid') {
            return res.status(200).json({ success: true, message: "Order is already paid" });
        }

        // Check if amount covers the order (allow small discrepancy or exact match)
        if (parseInt(transferAmount) >= parseInt(order.total_amount)) {
            // Update order status
            await Order.update(orderId, { payment_status: 'paid' });
            return res.status(200).json({ success: true, message: "Payment successful, order marked as paid" });
        } else {
            return res.status(200).json({ success: true, message: "Insufficient transfer amount" });
        }
    } catch (error) {
        console.error("SEPAY Webhook Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    handleSepayWebhook
};
