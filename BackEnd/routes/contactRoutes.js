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

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-z0-9]([a-z0-9._%+-]*[a-z0-9])?@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!emailRegex.test(trimmedEmail)) {
        throw new AppError(400, 'Địa chỉ email không đúng định dạng!');
    }

    if (trimmedEmail.includes('gmail.') && !trimmedEmail.endsWith('@gmail.com')) {
        throw new AppError(400, 'Địa chỉ Gmail phải có đuôi chính xác là @gmail.com (ví dụ: yourname@gmail.com)!');
    }

    const invalidTlds = ['.coz', '.con', '.comm', '.cpm', '.cmo'];
    if (invalidTlds.some(tld => trimmedEmail.endsWith(tld))) {
        throw new AppError(400, 'Tên miền email không hợp lệ!');
    }

    if (phone && phone.trim()) {
        if (!/^0(3|5|7|8|9)\d{8}$/.test(phone.trim())) {
            throw new AppError(400, 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!');
        }
    }

    const result = await EmailService.sendContactEmail({
        name: name.trim(),
        email: trimmedEmail,
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
