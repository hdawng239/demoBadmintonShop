const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserRepository = require('../repositories/userRepository');
const RefreshTokenRepository = require('../repositories/refreshTokenRepository');
const AppError = require('../utils/AppError');
require('dotenv').config();

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Chỉ lưu hash của refresh token vào DB, không lưu token thô
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

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
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_EXPIRES_IN }
        );
    },

    // Alias tên cũ, một số chỗ vẫn gọi generateToken
    generateToken: (user) => AuthService.generateAccessToken(user),

    generateRefreshToken: (user) => {
        const token = jwt.sign(
            { id: user.id, type: 'refresh' },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES_IN }
        );
        // Lấy exp từ token để tính expires_at lưu DB
        const decoded = jwt.decode(token);
        return {
            token,
            tokenHash: hashToken(token),
            expiresAt: new Date(decoded.exp * 1000),
        };
    },

    // Cấp cặp access + refresh token, lưu hash refresh vào DB
    _issueTokens: async (user) => {
        const accessToken = AuthService.generateAccessToken(user);
        const { token: refreshToken, tokenHash, expiresAt } = AuthService.generateRefreshToken(user);
        await RefreshTokenRepository.create(user.id, tokenHash, expiresAt);
        return { accessToken, refreshToken };
    },

    _generateRandomString: (length) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    getCaptcha: () => {
        const length = Math.floor(Math.random() * 3) + 4;
        const question = AuthService._generateRandomString(length);
        const answer = question.toUpperCase();

        // Băm đáp án với Hmac để tránh bị bot giải mã JWT đọc trộm
        const answerHash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(answer).digest('hex');

        const captchaToken = jwt.sign(
            { answerHash },
            process.env.JWT_SECRET,
            { expiresIn: '3m' }
        );

        return { question, captchaToken };
    },

    register: async ({ full_name, email, password, phone, address }) => {
        if (!email || !email.endsWith('@gmail.com')) {
            throw new AppError(400, 'Email bắt buộc phải là định dạng @gmail.com');
        }
        if (!phone || !/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
            throw new AppError(400, 'Số điện thoại bắt buộc phải có 10 chữ số và bắt đầu bằng số 0');
        }
        if (!address || address.trim() === '') {
            throw new AppError(400, 'Địa chỉ là bắt buộc');
        }

        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError(409, 'Email này đã được sử dụng!');
        }
        const existingPhone = await UserRepository.findByIdentifier(phone);
        if (existingPhone) {
            throw new AppError(409, 'Số điện thoại này đã được sử dụng!');
        }

        const hashedPassword = await AuthService.hashPassword(password);

        try {
            return await UserRepository.create({
                full_name,
                email,
                password: hashedPassword,
                role: 'customer',
                phone,
                address,
            });
        } catch (err) {
            if (err.code === '23505') throw new AppError(409, 'Email hoặc số điện thoại đã tồn tại!');
            throw err;
        }
    },

    login: async (email, password) => {
        const user = await UserRepository.findByIdentifier(email);
        if (!user) {
            throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác!');
        }

        const isMatch = await AuthService.comparePassword(password, user.password_hash);
        if (!isMatch) {
            throw new AppError(401, 'Tài khoản hoặc mật khẩu không chính xác!');
        }

        const { accessToken, refreshToken } = await AuthService._issueTokens(user);

        return {
            token: accessToken, // FE cũ đọc field 'token'
            accessToken,
            refreshToken,
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

    refreshAccessToken: async (refreshToken) => {
        if (!refreshToken) {
            throw new AppError(400, 'Thiếu refresh token!');
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        } catch (err) {
            throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn!');
        }
        if (decoded.type !== 'refresh') {
            throw new AppError(401, 'Token không phải là refresh token!');
        }

        // Đối chiếu DB: phải tồn tại, chưa bị thu hồi, chưa hết hạn
        const tokenHash = hashToken(refreshToken);
        const stored = await RefreshTokenRepository.findByHash(tokenHash);
        if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) {
            throw new AppError(401, 'Refresh token không hợp lệ hoặc đã bị thu hồi!');
        }

        const user = await UserRepository.findById(decoded.id);
        if (!user) {
            throw new AppError(401, 'Tài khoản không còn tồn tại!');
        }

        // Rotate: thu hồi token cũ rồi cấp cặp mới
        await RefreshTokenRepository.revokeByHash(tokenHash);
        const tokens = await AuthService._issueTokens(user);

        return {
            token: tokens.accessToken,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    },

    logout: async (refreshToken) => {
        if (refreshToken) {
            await RefreshTokenRepository.revokeByHash(hashToken(refreshToken));
        }
        return { message: 'Đăng xuất thành công!' };
    },

    _verifyCaptcha: (captchaAnswer, captchaToken) => {
        if (!captchaToken || captchaAnswer === undefined || captchaAnswer === '') {
            throw new AppError(400, 'Vui lòng hoàn thành mã Captcha!');
        }
        try {
            const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
            const userAnswerHash = crypto.createHmac('sha256', process.env.JWT_SECRET)
                .update(captchaAnswer.trim().toUpperCase())
                .digest('hex');

            if (userAnswerHash !== decoded.answerHash) {
                throw new AppError(400, 'Mã Captcha không chính xác!');
            }
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(400, 'Mã Captcha đã hết hạn hoặc không hợp lệ, vui lòng thử lại!');
        }
    },

    _sendOTPEmail: async (email, otp) => {
        // Chưa cấu hình Gmail thì in OTP ra console để test
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log(`\n======================================================`);
            console.log(`[TEST MODE] OTP khôi phục mật khẩu cho ${email} là: ${otp}`);
            console.log(`======================================================\n`);
            return { testMode: true, otp };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Cửa hàng Badminton Shop" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Mã xác nhận khôi phục mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto; border-radius: 10px;">
                    <h2 style="color: #ea580c; text-align: center; text-transform: uppercase;">Khôi Phục Mật Khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã gửi yêu cầu khôi phục mật khẩu tài khoản của mình trên hệ thống của chúng tôi.</p>
                    <div style="background-color: #fff7ed; border: 1px dashed #ea580c; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <span style="font-size: 24px; font-weight: bold; color: #ea580c; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>Mã xác nhận (OTP) này có hiệu lực trong vòng <b>5 phút</b>. Sau thời gian này, mã sẽ không còn tác dụng.</p>
                    <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn sẽ được giữ nguyên.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { testMode: false };
    },

    forgotPassword: async (email, captchaAnswer, captchaToken) => {
        if (!email) {
            throw new AppError(400, 'Vui lòng nhập email của bạn!');
        }

        AuthService._verifyCaptcha(captchaAnswer, captchaToken);

        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new AppError(404, 'Không tìm thấy tài khoản nào liên kết với email này!');
        }

        // OTP 6 số, hết hạn 5 phút
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await UserRepository.updateOTP(email, otp, expires);

        const result = await AuthService._sendOTPEmail(email, otp);

        if (result.testMode) {
            return {
                message: 'Mã OTP đã được tạo (Chế độ thử nghiệm: chưa cấu hình Gmail trong .env).',
                testMode: true,
                otp: result.otp,
            };
        }

        return { message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến!' };
    },

    resetPassword: async (email, otp, newPassword) => {
        if (!email || !otp || !newPassword) {
            throw new AppError(400, 'Vui lòng điền đầy đủ các thông tin bắt buộc!');
        }

        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new AppError(404, 'Không tìm thấy tài khoản tương ứng!');
        }

        if (!user.otp_code || user.otp_code !== otp) {
            throw new AppError(400, 'Mã xác nhận (OTP) không chính xác!');
        }

        const now = new Date();
        const otpExpires = new Date(user.otp_expires);
        if (now > otpExpires) {
            throw new AppError(400, 'Mã OTP đã hết hiệu lực, vui lòng lấy mã mới!');
        }

        const hashedPassword = await AuthService.hashPassword(newPassword);
        await UserRepository.resetPasswordWithOTP(email, hashedPassword);

        return { message: 'Khôi phục mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.' };
    },
};

module.exports = AuthService;
