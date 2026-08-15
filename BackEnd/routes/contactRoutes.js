const express = require('express');
const router = express.Router();
const EmailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

router.post('/', asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
        throw new AppError(400, 'Vui lòng điền đầy đủ Họ tên, Email và Nội dung lời nhắn!');
    }

    const result = await EmailService.sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : '',
        message: message.trim(),
    });

    if (result.error) {
        throw new AppError(500, 'Gặp sự cố khi gửi email liên hệ. Vui lòng thử lại sau!');
    }

    res.json({
        success: true,
        message: 'Gửi lời nhắn liên hệ thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.',
    });
}));

module.exports = router;
