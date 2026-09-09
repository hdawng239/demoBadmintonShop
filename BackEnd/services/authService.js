const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const EmailService = require('./emailService');
const UserRepository = require('../repositories/userRepository');
const RefreshTokenRepository = require('../repositories/refreshTokenRepository');
const AppError = require('../utils/AppError');

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const MIN_PASSWORD_LENGTH = 10;
const DUMMY_PASSWORD_HASH = '$2b$10$Qv/ZqgKQeM8q1sf1GRU9e.YTbDbdBflOG9xhh8xTlxp3ovlVumVsW';

// Chỉ lưu hash của refresh token trong DB.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const hashOtp = (email, otp) => crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${email}:${otp}`)
    .digest('hex');

const safeEqual = (left, right) => {
    const a = Buffer.from(String(left || ''));
    const b = Buffer.from(String(right || ''));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const validatePassword = (password) => {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        throw new AppError(400, `Mật khẩu phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự!`);
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw new AppError(400, 'Mật khẩu không được vượt quá 72 byte!');
    }
};

const AuthService = {
    hashPassword: async (plainPassword) => {
        const saltRounds = 10;
        return await bcrypt.hash(plainPassword, saltRounds);
    },

    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    generateAccessToken: (user) => {
        return jwt.sign(
            { id: user.id, role: user.role, type: 'access', ver: user.auth_version },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES_IN, algorithm: 'HS256' }
        );
    },

    generateToken: (user) => AuthService.generateAccessToken(user),

    generateRefreshToken: (user, csrfToken) => {
        const token = jwt.sign(
            { id: user.id, type: 'refresh', csrf: csrfToken, ver: user.auth_version },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES_IN, algorithm: 'HS256' }
        );
        const decoded = jwt.decode(token);
        return {
            token,
            tokenHash: hashToken(token),
            expiresAt: new Date(decoded.exp * 1000),
        };
    },

    _issueTokens: async (user) => {
        const accessToken = AuthService.generateAccessToken(user);
        const csrfToken = crypto.randomBytes(32).toString('base64url');
        const { token: refreshToken, tokenHash, expiresAt } = AuthService.generateRefreshToken(user, csrfToken);
        await RefreshTokenRepository.create(user.id, tokenHash, expiresAt);
        return { accessToken, refreshToken, csrfToken, refreshExpiresAt: expiresAt };
    },

    register: async ({ full_name, email, password, phone, address }) => {
        if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length > 150) {
            throw new AppError(400, 'Họ và tên là bắt buộc!');
        }
        if (typeof email !== 'string' || email.length > 254 || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
            throw new AppError(400, 'Email bắt buộc phải đúng định dạng @gmail.com (ví dụ: yourname@gmail.com)!');
        }
        if (typeof phone !== 'string' || !/^0(3|5|7|8|9)\d{8}$/.test(phone.trim())) {
            throw new AppError(400, 'Số điện thoại bắt buộc phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!');
        }
        if (typeof address !== 'string' || !address.trim() || address.trim().length > 500) {
            throw new AppError(400, 'Địa chỉ nhận hàng là bắt buộc!');
        }
        validatePassword(password);

        const normalized = {
            full_name: full_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
        };

        const existingUser = await UserRepository.findByEmail(normalized.email);
        if (existingUser) {
            throw new AppError(409, 'Email này đã được sử dụng!');
        }
        const existingPhone = await UserRepository.findByIdentifier(normalized.phone);
        if (existingPhone) {
            throw new AppError(409, 'Số điện thoại này đã được sử dụng!');
        }

        const hashedPassword = await AuthService.hashPassword(password);

        try {
            return await UserRepository.create({
                full_name: normalized.full_name,
                email: normalized.email,
                password: hashedPassword,
                role: 'customer',
                phone: normalized.phone,
                address: normalized.address,
            });
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Email hoặc số điện thoại đã tồn tại!');
            throw err;
        }
    },

    login: async (email, password) => {
        if (
            typeof email !== 'string'
            || typeof password !== 'string'
            || !email.trim()
            || Buffer.byteLength(password, 'utf8') > 72
        ) {
            throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác!');
        }
        const identifier = email.trim().includes('@') ? email.trim().toLowerCase() : email.trim();
        const user = await UserRepository.findByIdentifier(identifier);
        if (!user) {
            // Giảm chênh lệch thời gian xử lý để tránh dò tài khoản.
            await AuthService.comparePassword(password, DUMMY_PASSWORD_HASH);
            throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác!');
        }

        const isMatch = await AuthService.comparePassword(password, user.password_hash);
        if (!isMatch) {
            throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác!');
        }

        const { accessToken, refreshToken, csrfToken, refreshExpiresAt } = await AuthService._issueTokens(user);

        return {
            token: accessToken,
            accessToken,
            refreshToken,
            csrfToken,
            refreshExpiresAt,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
            },
        };
    },

    _verifyRefreshToken: (refreshToken, csrfToken) => {
        if (!refreshToken) {
            throw new AppError(401, 'Thiếu refresh token!');
        }

        try {
            const decoded = jwt.verify(refreshToken, REFRESH_SECRET, { algorithms: ['HS256'] });
            if (decoded.type !== 'refresh' || !csrfToken || !safeEqual(decoded.csrf, csrfToken)) {
                throw new Error('Invalid refresh CSRF');
            }
            return decoded;
        } catch (err) {
            throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn!');
        }
    },

    refreshAccessToken: async (refreshToken, csrfToken) => {
        const decoded = AuthService._verifyRefreshToken(refreshToken, csrfToken);

        // Thu hồi bằng một UPDATE để mỗi refresh token chỉ dùng được một lần.
        const tokenHash = hashToken(refreshToken);
        const stored = await RefreshTokenRepository.consumeByHash(tokenHash);
        if (!stored) {
            throw new AppError(401, 'Refresh token không hợp lệ hoặc đã bị thu hồi!');
        }

        const user = await UserRepository.findAuthState(decoded.id);
        if (!user || !Number.isInteger(decoded.ver) || decoded.ver !== user.auth_version) {
            throw new AppError(401, 'Tài khoản không còn tồn tại!');
        }

        const tokens = await AuthService._issueTokens(user);

        return {
            token: tokens.accessToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            csrfToken: tokens.csrfToken,
            refreshExpiresAt: tokens.refreshExpiresAt,
        };
    },

    logout: async (refreshToken, csrfToken) => {
        if (refreshToken) {
            try {
                AuthService._verifyRefreshToken(refreshToken, csrfToken);
                await RefreshTokenRepository.revokeByHash(hashToken(refreshToken));
            } catch (_) {
                // Vẫn xóa cookie khi token hỏng hoặc hết hạn.
            }
        }
        return { message: 'Đăng xuất thành công!' };
    },

    verifyTurnstile: async (turnstileToken, remoteIp) => {
        const secret = process.env.TURNSTILE_SECRET_KEY;
        if (!secret && process.env.NODE_ENV !== 'production') return true;
        if (!secret || !turnstileToken) throw new AppError(400, 'Vui lòng hoàn thành xác minh chống bot!');

        const body = new URLSearchParams({ secret, response: turnstileToken });
        if (remoteIp) body.set('remoteip', remoteIp);
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body,
            signal: AbortSignal.timeout(5000),
        });
        const result = await response.json();
        if (!result.success) throw new AppError(400, 'Xác minh chống bot không hợp lệ hoặc đã hết hạn!');
        return true;
    },

    forgotPassword: async (email, turnstileToken, remoteIp) => {
        if (typeof email !== 'string' || !email.trim() || email.length > 254) {
            throw new AppError(400, 'Vui lòng nhập email của bạn!');
        }
        await AuthService.verifyTurnstile(turnstileToken, remoteIp);

        const trimmedEmail = email.trim().toLowerCase();
        const user = await UserRepository.findByEmail(trimmedEmail);
        if (!user) {
            // Không tiết lộ email có tồn tại hay không.
            return { message: 'Nếu email tồn tại, mã xác nhận sẽ được gửi trong ít phút.' };
        }
        if (user.otp_last_sent_at && Date.now() - new Date(user.otp_last_sent_at).getTime() < 60_000) {
            return { message: 'Nếu email tồn tại, mã xác nhận sẽ được gửi trong ít phút.' };
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await UserRepository.updateOTP(user.email, hashOtp(user.email, otp), expires);

        const sendResult = await EmailService.sendOtpEmail(user.email, otp);
        if (!sendResult?.sent) {
            await UserRepository.clearOTP(user.email);
            console.error('[Auth] Không thể gửi email OTP; mã đã được thu hồi.');
        }

        return { message: 'Nếu email tồn tại, mã xác nhận sẽ được gửi trong ít phút.' };
    },

    resetPassword: async (email, otp, newPassword) => {
        if (typeof email !== 'string' || !email.trim() || email.length > 254 || !otp || !newPassword) {
            throw new AppError(400, 'Vui lòng điền đầy đủ các thông tin bắt buộc!');
        }
        validatePassword(newPassword);

        const trimmedEmail = email.trim().toLowerCase();
        const user = await UserRepository.findByEmail(trimmedEmail);
        if (!user) {
            throw new AppError(400, 'Mã xác nhận không chính xác, đã hết hạn hoặc vượt quá số lần thử!');
        }

        const submittedOtp = typeof otp === 'string' ? otp.trim() : String(otp);
        const hashedPassword = await AuthService.hashPassword(newPassword);
        const consumed = /^\d{6}$/.test(submittedOtp)
            ? await UserRepository.consumeOTPAndResetPassword(user.email, hashOtp(user.email, submittedOtp), hashedPassword)
            : null;
        if (!consumed) {
            await UserRepository.recordFailedOTPAttempt(user.email);
            throw new AppError(400, 'Mã xác nhận không chính xác, đã hết hạn hoặc vượt quá số lần thử!');
        }
        await RefreshTokenRepository.revokeAllByUser(consumed.id);

        return { message: 'Khôi phục mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.' };
    },
};

AuthService.validatePassword = validatePassword;

module.exports = AuthService;
