const crypto = require('crypto');
const AuthService = require('./authService');
const UserRepository = require('../repositories/userRepository');
const EmailChangeRepository = require('../repositories/emailChangeRepository');
const EmailService = require('./emailService');
const AppError = require('../utils/AppError');

const normalizeEmail = (email) => {
    if (typeof email !== 'string' || email.length > 254 || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
        throw new AppError(400, 'Email mới phải là địa chỉ Gmail hợp lệ.');
    }
    return email.trim().toLowerCase();
};
const hashCode = (id, email, code) => crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(`email-change:${id}:${email}:${code}`).digest('hex');

module.exports = {
    request: async (actor, email, currentPassword) => {
        const normalized = normalizeEmail(email);
        const user = await UserRepository.findByIdInternal(actor.id);
        if (!user || user.auth_version !== actor.ver) throw new AppError(401, 'Vui lòng đăng nhập lại.');
        if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword, 'utf8') > 72
            || !await AuthService.comparePassword(currentPassword, user.password_hash)) {
            throw new AppError(400, 'Mật khẩu hiện tại không chính xác.');
        }
        if (normalized === user.email) throw new AppError(400, 'Email mới trùng email hiện tại.');
        if (await UserRepository.findByEmail(normalized)) throw new AppError(409, 'Không thể sử dụng email này.');
        const code = crypto.randomInt(100000, 1000000).toString();
        const tokenHash = hashCode(actor.id, normalized, code);
        if (!await EmailChangeRepository.request(actor.id, normalized, tokenHash, actor.ver)) {
            const error = new AppError(429, 'Vui lòng chờ trước khi gửi lại mã đổi email.');
            error.retryAfterSeconds = await EmailChangeRepository.retryAfterSeconds(actor.id);
            throw error;
        }
        const result = await EmailService.sendOtpEmail(normalized, code, 'email-change');
        if (!result?.sent) {
            await EmailChangeRepository.discard(actor.id, tokenHash);
            if (result?.reason === 'sender_not_verified') {
                throw new AppError(503, 'Địa chỉ gửi email chưa được xác minh trên Brevo.');
            }
            if (result?.reason === 'provider_unauthorized') {
                throw new AppError(503, 'Brevo API key không hợp lệ hoặc chưa được kích hoạt.');
            }
            if (result?.reason === 'not_configured') {
                throw new AppError(503, 'Dịch vụ gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
            }
            throw new AppError(503, 'Không gửi được email xác nhận. Vui lòng thử lại.');
        }
        return { message: 'Mã xác nhận đã được gửi tới email mới, có hiệu lực 5 phút.', retryAfterSeconds: 60 };
    },
    confirm: async (actor, email, otp) => {
        const normalized = normalizeEmail(email);
        if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) throw new AppError(400, 'Mã xác nhận phải gồm 6 chữ số.');
        try {
            if (!await EmailChangeRepository.confirm(actor.id, normalized, hashCode(actor.id, normalized, otp), actor.ver)) {
                throw new AppError(400, 'Mã xác nhận sai, hết hạn hoặc vượt quá số lần thử.');
            }
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Không thể sử dụng email này.');
            throw err;
        }
        return { message: 'Đã đổi email. Vui lòng đăng nhập lại bằng email mới.' };
    },
};
